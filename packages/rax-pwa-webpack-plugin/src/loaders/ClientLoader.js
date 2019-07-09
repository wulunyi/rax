const qs = require('querystring');

module.exports = function(source) {
  const query = typeof this.query === 'string' ? qs.parse(this.query.substr(1)) : this.query;

  const {
    ssr,
    withAppShell,
    driver
  } = query;
  let code = source;
  if (ssr === 'true') {
    const functionName = '_PWA_page_component_';
    const renderCodeStr = withAppShell === 'true' ?
      `render(createElement(AppShell, Object.assign(data || {}, { Component: function(props) {return createElement(${functionName}, props || {}); }})), document.getElementById('root'), { driver: Driver, hydrate: true });` :
      `render(createElement(${functionName}, data || {}), document.getElementById('root'), { driver: Driver, hydrate: true });`;
    // Get target function name
    if (code.indexOf('export default') !== -1) {
      // export default function ...
      // export default Index
      code = source.replace('export default', `var ${functionName} =`);
    } else {
      // export { Index as default };
      // export { Index }
      const test = /export { (\S*) }/.exec(code);
      if (test) {
        code += `var ${functionName} = ${test[1]}`;
      }
    }

    const driverStr = driver === 'universal' ? "import Driver from 'driver-universal/lib/dom';" : "import * as Driver from 'driver-dom'";

    code += `
      import {render} from 'rax';
      ${driverStr}
      ${withAppShell === 'true' ? "import AppShell from '../../shell/';" : ''}
      window.addEventListener( "load", function(){
        var data = null;
        try {
          data = JSON.parse(document.querySelector("[data-from='server']").innerHTML);
        } catch (e) {
          // ignore
        }
        if (data !== null || !${functionName}.getInitialProps) {
          renderComponent();
        } else {
          ${functionName}.getInitialProps().then(renderComponent);
        }

        function renderComponent() {
          ${renderCodeStr}
        }
      })
    `;
  }

  return code;
};
