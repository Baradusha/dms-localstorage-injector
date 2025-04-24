document.addEventListener("DOMContentLoaded", async () => {
  await updateCheckboxes();
});

document.getElementById("applyBtn").addEventListener("click", async () => {
  executeAction(applyChanges);
});

function getSelectedModules() {
  const checkboxes = document.querySelectorAll(
    '#modulesContainer input[type="checkbox"]:checked'
  );
  return Array.from(checkboxes).map((checkbox) => checkbox.value);
}

function isDevToolsChecked() {
  return document.getElementById("devtoolsCheckbox").checked;
}

// Функция для установки текущего окружения в заголовке
function setEnvTitle(env) {
  const envTitle = document.getElementById("envTitle");
  const envNames = {
    dev: "dms.dar-dev.zone",
    qa: "dms.dar-qa.zone",
    "stage-qa": "stage-dms.dar-qa.zone",
    "dar-io": "dms.dar.io",
    "darlean-kz": "app.darlean.kz",
    "darlean-eu": "app.darlean.eu",
    "darlean-com": "app.darlean.com",
  };

  envTitle.textContent = `Окружение: ${envNames[env] || env}`;
}

function resetCheckboxes() {
  document
    .querySelectorAll('#modulesContainer input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.checked = false;
    });
  document.getElementById("devtoolsCheckbox").checked = false;
}

function showNotAvailableMessage() {
  const container = document.querySelector(".container");
  container.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <p>Это расширение доступно только для следующих окружений:</p>
      <ul style="list-style: none; padding: 0;">
        <li>• dms.dar-dev.zone</li>
        <li>• dms.dar-qa.zone</li>
        <li>• stage-dms.dar-qa.zone</li>
        <li>• dms.dar.io</li>
        <li>• app.darlean.kz</li>
        <li>• app.darlean.eu</li>
        <li>• app.darlean.com</li>
      </ul>
    </div>
  `;
}

function getEnvironmentFromUrl(url) {
  if (url.includes("dms.dar-dev.zone")) {
    return "dev";
  } else if (url.includes("stage-dms.dar-qa.zone")) {
    return "stage-qa";
  } else if (url.includes("dms.dar-qa.zone")) {
    return "qa";
  } else if (url.includes("dms.dar.io")) {
    return "dar-io";
  } else if (url.includes("app.darlean.kz")) {
    return "darlean-kz";
  } else if (url.includes("app.darlean.eu")) {
    return "darlean-eu";
  } else if (url.includes("app.darlean.com")) {
    return "darlean-com";
  }
  return null;
}

function getUrlForEnvironment(env) {
  switch (env) {
    case "dev":
      return "https://dms.dar-dev.zone";
    case "qa":
      return "https://dms.dar-qa.zone";
    case "stage-qa":
      return "https://stage-dms.dar-qa.zone";
    case "dar-io":
      return "https://dms.dar.io";
    case "darlean-kz":
      return "https://app.darlean.kz";
    case "darlean-eu":
      return "https://app.darlean.eu";
    case "darlean-com":
      return "https://app.darlean.com";
    default:
      return null;
  }
}

async function updateCheckboxes() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const env = getEnvironmentFromUrl(tab.url);

    resetCheckboxes();

    if (env) {
      setEnvTitle(env);
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
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

          return {
            overrides: getCurrentOverrides(),
            devtools: isDevToolsEnabled(),
          };
        },
        world: "MAIN",
      });

      const { overrides, devtools } = result[0].result || {
        overrides: [],
        devtools: false,
      };

      document.getElementById("devtoolsCheckbox").checked = devtools;

      overrides.forEach((module) => {
        const checkbox = document.querySelector(
          `#modulesContainer input[value="${module}"]`
        );
        if (checkbox) {
          checkbox.checked = true;
        }
      });
    } else {
      showNotAvailableMessage();
    }
  } catch (err) {
    console.error("Ошибка при обновлении чекбоксов:", err);
    resetCheckboxes();
  }
}

async function executeAction(action) {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    const env = getEnvironmentFromUrl(tab.url);
    const selectedModules = getSelectedModules();
    const devtoolsEnabled = isDevToolsChecked();

    const envUrl = getUrlForEnvironment(env);

    if (envUrl && tab.url.includes(envUrl)) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (modules, devtools) => {
          const MODULE_URLS = {
            "@dar-dms/chat": "http://localhost:8080/dar-dms-chat.js",
            "@dar-dms/bot": "http://localhost:8081/dar-dms-bot.js",
            "@dar-dms/automations":
              "http://localhost:8082/dar-dms-automations.js",
            "@dar-dms/comms": "http://localhost:4200/dar-dms-comms.js",
            "@dar-dms/moms": "http://localhost:4101/dar-dms-moms.js",
            "@dar-dms/home": "http://localhost:4202/darlean-home.js",
            "@dar-dms/topbar": "http://localhost:4209/dar-dms-topbar.js",
          };

          const currentOverrides = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith("import-map-override:")) {
              currentOverrides.push(key.replace("import-map-override:", ""));
              localStorage.removeItem(key);
            }
          }

          modules.forEach((module) => {
            const key = `import-map-override:${module}`;
            localStorage.setItem(key, MODULE_URLS[module]);
          });

          if (devtools) {
            localStorage.setItem("devtools", "true");
          } else {
            localStorage.removeItem("devtools");
          }

          alert("Изменения успешно применены!");
          location.reload();
        },
        args: [selectedModules, devtoolsEnabled],
        world: "MAIN",
      });
      await updateCheckboxes();
    } else {
      alert(`Это расширение работает только на поддерживаемых окружениях.`);
    }
  } catch (err) {
    alert("Произошла ошибка при выполнении операции");
  }
}
