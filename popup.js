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

function setEnvSelect(env) {
  const envSelect = document.getElementById("envSelect");
  envSelect.value = env;
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
      </ul>
    </div>
  `;
}

async function updateCheckboxes() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    let env = null;
    if (tab.url.includes("dms.dar-dev.zone")) {
      env = "dev";
    } else if (tab.url.includes("dms.dar-qa.zone")) {
      env = "qa";
    }

    resetCheckboxes();

    if (env) {
      setEnvSelect(env);
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

    const envSelect = document.getElementById("envSelect");
    const selectedEnv = envSelect.value;
    const selectedModules = getSelectedModules();
    const devtoolsEnabled = isDevToolsChecked();

    const envUrl =
      selectedEnv === "dev"
        ? "https://dms.dar-dev.zone"
        : "https://dms.dar-qa.zone";

    if (tab.url.includes(envUrl)) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (modules, devtools) => {
          const MODULE_URLS = {
            "@dar-dms/chat": "http://localhost:8080/dar-dms-chat.js",
            "@dar-dms/moms": "http://localhost:4101/dar-dms-moms.js",
            "@dar-dms/comms": "http://localhost:4200/dar-dms-comms.js",
          };

          // Удаляем все существующие override
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
      alert(`Это расширение работает только на вкладке ${envUrl}.`);
    }
  } catch (err) {
    alert("Произошла ошибка при выполнении операции");
  }
}

document
  .getElementById("envSelect")
  .addEventListener("change", updateCheckboxes);
