const MODULE_URLS = {
  "@dar-dms/chat": "http://localhost:8080/dar-dms-chat.js",
  "@dar-dms/moms": "http://localhost:4101/dar-dms-moms.js",
  "@dar-dms/comms": "http://localhost:4200/dar-dms-comms.js",
};

function getCurrentOverrides() {
  const overrides = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("import-map-override:")) {
      overrides.push(key.replace("import-map-override:", ""));
    }
  }
  return overrides;
}

function isDevToolsEnabled() {
  return localStorage.getItem("devtools") === "true";
}

function applyChanges(selectedModules, devtoolsEnabled) {
  const currentOverrides = getCurrentOverrides();
  currentOverrides.forEach((module) => {
    localStorage.removeItem(`import-map-override:${module}`);
  });

  selectedModules.forEach((module) => {
    const key = `import-map-override:${module}`;
    localStorage.setItem(key, MODULE_URLS[module]);
  });

  if (devtoolsEnabled) {
    localStorage.setItem("devtools", "true");
  } else {
    localStorage.removeItem("devtools");
  }

  alert("Изменения успешно применены!");
  location.reload();
}
