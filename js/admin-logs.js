(function(){'use strict';window.AdminLogs=Object.freeze({list:()=>AdminCore.snapshot().logs,write:AdminCore.log,export:()=>JSON.stringify(AdminCore.snapshot().logs,null,2)});}());
