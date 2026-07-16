(function(){'use strict';window.AdminBackup=Object.freeze({create:AdminCore.createBackup,export:AdminCore.exportData,restore:AdminCore.restoreBackup,list:()=>AdminCore.snapshot().backups});}());
