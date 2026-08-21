/**
 * SNESvault - Custom Gamepad Mappings
 *
 * 8BitDo M30 2.4G USB Receiver
 * ID: 6B controller (Vendor: 0ca3 Product: 0024)
 *
 * Este archivo NO modifica SuperNintendo.js/Snes9x.
 * Traduce el M30 a los controles de teclado que utiliza SuperNintendo.js.
 *
 * El M30 tiene 6 botones de cara + L/R + Start (9 físicos) para 8 acciones
 * SNES (A, B, X, Y, L, R, Start, Select). Se usan los hombros reales del
 * M30 (índices 6/7) para L/R en vez de reciclar C/Z, y el botón C cubre
 * Select. El botón Z queda libre (el pad SNES no tiene 6° botón de cara).
 *
 *        X(3)  Y(0)  Z(4)
 *        A(2)  B(1)  C(5)
 *
 * Start = 9
 * L = 6
 * R = 7
 */

(() => {
    "use strict";

    // ============================================================
    // CONFIGURACIÓN
    // ============================================================

    const M30_VENDOR = "0ca3";
    const M30_PRODUCT = "0024";

    // Mapping físico del 8BitDo M30 → acciones SNES → tecla del keymap
    // default de SNESvault (a:KeyW, b:KeyQ, x:KeyS, y:KeyA, l:KeyZ, r:KeyX,
    // start:Enter, select:ShiftRight). Si editás el keymap desde
    // "Ver Controles", actualizá también esta tabla a mano.
    const M30_BUTTONS = {
        2: "KeyW", // M30 A → SNES B
        1: "KeyQ", // M30 B → SNES A

        3: "KeyA", // M30 X → SNES Y
        0: "KeyS", // M30 Y → SNES X

        6: "KeyZ", // M30 L (hombro) → SNES L
        7: "KeyX", // M30 R (hombro) → SNES R

        5: "ShiftRight", // M30 C → SNES Select

        9: "Enter" // M30 Start → SNES Start
    };

    // ============================================================
    // ESTADO
    // ============================================================

    const previousButtons = {};

    const previousDirections = {
        up: false,
        down: false,
        left: false,
        right: false
    };

    let activeM30Index = null;
    let wasConnected = false;

    // ============================================================
    // DETECCIÓN DEL M30
    // ============================================================

    function isM30(gamepad) {
        if (!gamepad || !gamepad.id) {
            return false;
        }

        const id = gamepad.id.toLowerCase();

        return (
            id.includes(`vendor: ${M30_VENDOR}`) &&
            id.includes(`product: ${M30_PRODUCT}`)
        );
    }

    // ============================================================
    // EVENTOS DE TECLADO
    // ============================================================

    function sendKey(code, pressed) {
        const eventType = pressed ? "keydown" : "keyup";

        const event = new KeyboardEvent(eventType, {
            code: code,
            key: getKeyValue(code),
            bubbles: true,
            cancelable: true
        });

        document.dispatchEvent(event);
    }

    function getKeyValue(code) {
        const keys = {
            KeyW: "w",
            KeyQ: "q",
            KeyA: "a",
            KeyS: "s",
            KeyZ: "z",
            KeyX: "x",

            ShiftRight: "Shift",
            Enter: "Enter",

            ArrowUp: "ArrowUp",
            ArrowDown: "ArrowDown",
            ArrowLeft: "ArrowLeft",
            ArrowRight: "ArrowRight"
        };

        return keys[code] || code;
    }

    // ============================================================
    // BOTONES
    // ============================================================

    function updateButton(index, pressed) {
        if (previousButtons[index] === pressed) {
            return;
        }

        previousButtons[index] = pressed;

        const code = M30_BUTTONS[index];

        if (code) {
            sendKey(code, pressed);
        }
    }

    // ============================================================
    // D-PAD
    // ============================================================

    function updateDirection(name, code, pressed) {
        if (previousDirections[name] === pressed) {
            return;
        }

        previousDirections[name] = pressed;

        sendKey(code, pressed);
    }

    // ============================================================
    // RESET
    // ============================================================

    function releaseAllInputs() {
        Object.entries(M30_BUTTONS).forEach(([index, code]) => {
            if (previousButtons[index]) {
                sendKey(code, false);
            }

            previousButtons[index] = false;
        });

        const directions = {
            up: "ArrowUp",
            down: "ArrowDown",
            left: "ArrowLeft",
            right: "ArrowRight"
        };

        Object.entries(directions).forEach(([name, code]) => {
            if (previousDirections[name]) {
                sendKey(code, false);
            }

            previousDirections[name] = false;
        });
    }

    // ============================================================
    // BUSCAR M30
    // ============================================================

    function findM30() {
        const gamepads = navigator.getGamepads
            ? navigator.getGamepads()
            : [];

        for (const gamepad of gamepads) {
            if (gamepad && isM30(gamepad)) {
                return gamepad;
            }
        }

        return null;
    }

    // ============================================================
    // LOOP PRINCIPAL
    // ============================================================

    function pollGamepad() {
        const gamepad = findM30();

        if (!gamepad) {
            if (wasConnected) {
                console.log("[SNESvault] 8BitDo M30 desconectado");

                releaseAllInputs();

                wasConnected = false;
                activeM30Index = null;
            }

            requestAnimationFrame(pollGamepad);
            return;
        }

        if (!wasConnected || activeM30Index !== gamepad.index) {
            console.log(
                "[SNESvault] 8BitDo M30 detectado:",
                gamepad.id
            );

            console.log(
                "[SNESvault] Mapping especial M30 activado"
            );

            wasConnected = true;
            activeM30Index = gamepad.index;
        }

        // ----------------------------------------------------------
        // Botones A/B/X/Y/L/R/C(Select)/Start
        // ----------------------------------------------------------

        Object.keys(M30_BUTTONS).forEach(index => {
            const buttonIndex = Number(index);

            const pressed =
                gamepad.buttons[buttonIndex]?.pressed === true;

            updateButton(buttonIndex, pressed);
        });

        // ----------------------------------------------------------
        // D-Pad
        // ----------------------------------------------------------

        const axisX = gamepad.axes[0] || 0;
        const axisY = gamepad.axes[1] || 0;

        const DEADZONE = 0.5;

        updateDirection(
            "left",
            "ArrowLeft",
            axisX < -DEADZONE
        );

        updateDirection(
            "right",
            "ArrowRight",
            axisX > DEADZONE
        );

        updateDirection(
            "up",
            "ArrowUp",
            axisY < -DEADZONE
        );

        updateDirection(
            "down",
            "ArrowDown",
            axisY > DEADZONE
        );

        requestAnimationFrame(pollGamepad);
    }

    // ============================================================
    // INICIO
    // ============================================================

    window.addEventListener("gamepadconnected", event => {
        if (isM30(event.gamepad)) {
            console.log(
                "[SNESvault] Conectado:",
                event.gamepad.id
            );
        }
    });

    window.addEventListener("gamepaddisconnected", event => {
        if (isM30(event.gamepad)) {
            releaseAllInputs();

            wasConnected = false;
            activeM30Index = null;
        }
    });

    requestAnimationFrame(pollGamepad);

})();
