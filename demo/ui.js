/*
	ui.js
	
    Copyright (C) 2015 - 2021 Corey Shuman <ctshumancode@gmail.com>
	
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

$(function () {
  function addSettingsSlider(setting) {
    const settingUI = $("<div></div>")
      .append(
        $("<p></p>")
          .append($("<label></label>").append(`${setting.name}:`))
          .append($("<span/><span>"))
          .append(
            $("<span></span>").append(
              setting.useDivisor ? "&times;10<sup>-4</sup>" : ""
            )
          )
      )
      .append($("<div></div>").slider(setting.config))
      .appendTo($("#control-sliders"));

    if (setting.invertible) {
      $(settingUI)
        .children("p")
        .append($("<span>Invert</span>").css("float", "right"))
        .append(
          $("<input type='checkbox' class='invert'/>")
            .prop("checked", setting.inverted)
            .css("float", "right")
        );
    }

    const updateValueEvent = (ev, ui) => {
      const slider = $(ev.currentTarget);
      let text = "";

      if (setting.config.range) {
        text = `${ui.values[0]} - ${ui.values[1]}`;
      } else {
        text = `${ui.value}`;
      }

      $(ev.currentTarget).parent().find("p > span").first().text(text);

      const data = {
        value: ui.value,
        // must create a copy of values array, and it's a fake array so no slice()
        values: setting.config.range
          ? setting.inverted
            ? [ui.values[1], ui.values[0]]
            : [ui.values[0], ui.values[1]]
          : null,
      };
      if (setting.useDivisor) {
        if (setting.config.range) {
          data.values[0] /= 10000;
          data.values[1] /= 10000;
        } else {
          data.value /= 10000;
        }
      }

      setSetting(
        setting.settingName,
        setting.config.range ? data.values : data.value
      );
    };

    const slider = settingUI.children(".ui-slider");

    slider.on("slide", (ev, data) => {
      updateValueEvent(ev, data);
    });

    let invertCheck = null;
    if (setting.invertible) {
      invertCheck = settingUI.find("p > input.invert");
      invertCheck.on("change", (ev, data) => {
        setting.inverted = ev.target.checked;
        updateValueEvent(ev, { values: slider.slider("values") });
      });
    }

    const updateValue = (value, inverted) => {
      console.log("updateValue", setting.settingName, value);
      slider.slider(
        "option",
        typeof value === "object" ? "values" : "value",
        typeof value === "object" ? [value[0], value[1]] : value
      );
      inverted ? (setting.inverted = true) : (setting.inverted = false);
      if (invertCheck) {
        invertCheck.prop("checked", setting.inverted);
      }
      updateValueEvent({ currentTarget: slider }, { value, values: value });
    };

    updateValue(
      setting.config.range ? setting.config.values : setting.config.value,
      setting.inverted
    );

    return updateValue;
  }

  const settingSliders = [
    {
      name: "Point Density",
      settingName: "pointDensity",
      invertible: false,
      config: {
        range: false,
        min: 0,
        max: 400,
        value: 30,
      },
      useDivisor: false,
    },
    {
      name: "Point Size",
      settingName: "pointSize",
      invertible: false,
      config: {
        range: false,
        min: 0,
        max: 100,
        value: 3,
      },
      useDivisor: false,
    },
    {
      name: "Friction",
      settingName: "friction",
      invertible: false,
      config: {
        range: false,
        min: 0,
        max: 10000,
        value: 300,
      },
      useDivisor: true,
    },
    {
      name: "Friction Min Velocity",
      settingName: "frictionMinVelocity",
      invertible: false,
      config: {
        range: false,
        min: 0,
        max: 10000,
        value: 5000,
      },
      useDivisor: true,
    },
    {
      name: "Attract Distance",
      settingName: "attractDistanceRange",
      invertible: false,
      config: {
        range: true,
        min: 0,
        max: 1000,
        values: [15, 30],
      },
      useDivisor: false,
    },
    {
      name: "Attract Force",
      settingName: "attractForceRange",
      invertible: true,
      inverted: false,
      config: {
        range: true,
        min: 0,
        max: 10000,
        values: [0, 10],
      },
      useDivisor: true,
    },
    {
      name: "Repel Distance",
      settingName: "repelDistanceRange",
      invertible: false,
      config: {
        range: true,
        min: 0,
        max: 1000,
        values: [0, 20],
      },
      useDivisor: false,
    },
    {
      name: "Repel Force",
      settingName: "repelForceRange",
      invertible: true,
      inverted: true,
      config: {
        range: true,
        min: 0,
        max: 10000,
        values: [0, 1000],
      },
      useDivisor: true,
    },
    {
      name: "Line Length",
      settingName: "maxLineLength",
      invertible: false,
      config: {
        range: false,
        min: 0,
        max: 1000,
        value: 60,
      },
      useDivisor: false,
    },
    {
      name: "Line Size",
      settingName: "lineSize",
      invertible: false,
      config: {
        range: false,
        min: 1,
        max: 50,
        value: 2,
      },
      useDivisor: false,
    },
    {
      name: "Screen Blur",
      settingName: "screenBlur",
      invertible: false,
      config: {
        range: false,
        min: 0,
        max: 10000,
        value: 6000,
      },
      useDivisor: true,
    },
    {
      name: "Interact Distance",
      settingName: "maxInteractDistance",
      invertible: false,
      config: {
        range: false,
        min: 0,
        max: 1000,
        value: 60,
      },
      useDivisor: false,
    },
    {
      name: "Interact Force",
      settingName: "maxInteractForce",
      invertible: false,
      config: {
        range: false,
        min: 1000,
        max: 10000,
        value: 3000,
      },
      useDivisor: true,
    },
  ];

  settingSliders.forEach((setting) => {
    setting.update = addSettingsSlider(setting);
  });

  function addColorPicker(setting) {
    const settingUI = $("<div class='color-box'></div>")
      .append(
        $("<p></p>").append($("<label></label>").append(`${setting.name}`))
      )
      .append($("<input type='color' />"))
      .appendTo($("#color-container"));

    const colorPicker = settingUI.children("input");

    function updateValue(value) {
      colorPicker.val(value);
      setSetting(setting.settingName, value);
    }

    colorPicker.on("change", (e) => {
      setSetting(setting.settingName, e.target.value);
    });

    return updateValue;
  }

  const settingColors = [
    {
      name: "Back Color",
      settingName: "backgroundColor",
    },
    {
      name: "Point Color",
      settingName: "pointColor",
    },
    {
      name: "Line Color",
      settingName: "lineColor",
    },
    {
      name: "Interact Color",
      settingName: "pointInteractColor",
    },
  ];

  settingColors.forEach((setting) => {
    setting.update = addColorPicker(setting);
  });

  $("select#mode").change(function (e) {
    setSetting("interactMode", this.value);
  });

  $("#queue-draws").change(function (e) {
    setSetting("useQueuedDraws", this.checked);
  });

  $("#ping-pong").change(function (e) {
    setSetting("pingPongPhysicsUpdates", this.checked);
  });

  // in presets.js
  demoPresets.forEach((preset) => createDemoSetting(preset));

  function createDemoSetting(preset) {
    const button = $("<button />")
      .append(preset.name)
      .on("click", () => {
        setPreset(preset.settings);
      })
      .appendTo($("#preset-buttons"));
  }

  function setPreset(settings) {
    settingSliders.forEach((slider) => {
      // damn zero check, need !isNaN
      if (
        settings[slider.settingName] ||
        !isNaN(settings[slider.settingName])
      ) {
        // support settings as single integer, array of integers, or object with inverted flag
        if (
          !Array.isArray(settings[slider.settingName]) &&
          isNaN(settings[slider.settingName])
        ) {
          console.log("object", settings[slider.settingName]);
          slider.update(
            settings[slider.settingName].value,
            slider.invertible ? settings[slider.settingName].inverted : false
          );
        } else {
          slider.update(settings[slider.settingName], false);
        }
      }

      settingColors.forEach((colorPicker) => {
        colorPicker.update(settings[colorPicker.settingName]);
      });

      $("select#mode").val(settings["interactMode"]).trigger("change");
    });
  }

  function setSetting(settingName, value) {
    console.log(settingName, value);
    window.constellation.updateSetting(settingName, value);
  }

  setPreset(demoPresets[0].settings);
});
