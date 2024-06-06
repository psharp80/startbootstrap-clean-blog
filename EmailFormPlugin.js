$(document).ready(function () {
    var divId = "pluginButtonContainer";
    var buttonId = "btnEmailForm";

    function encodeParams(params) {
        const encodedComponents = [];
        for (const key in params) {
            let value = params[key];
            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            encodedComponents.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        }
        return encodedComponents.join('&');
    }

    function createiFrameURL(params) {
        let localParams = { ...params };
        let baseURL = localParams.rootUrl + "EmailConsole/index.html";
        delete localParams.rootUrl;
        delete localParams.type;
        return baseURL + '?' + encodeParams(localParams);
    }

    function createOverlay() {
        var overlay = $("<div>", {
            class: 'overlay',
            css: {
                display: "none",
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.85)",
                zIndex: "999"
            }
        }).appendTo("body");

        return overlay;
    }

    function createEmailFormButton() {
        var svgIcon = "<svg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 -960 960 960' width='24px' fill='#e8eaed'><path d='M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm320-280L160-640v400h640v-400L480-440Zm0-80 320-200H160l320 200ZM160-640v-80 480-400Z'/></svg>";
        var button = $("<button>", {
            css: {
                cursor: "pointer",
                backgroundColor: "rgb(101, 117, 142)",
                width: "58px",
                height: "58px",
                border: "none",
                borderRadius: "9999px",
                margin: "0 0 1em 0"
            }
        }).attr("id", buttonId).html(svgIcon);

        $("#" + divId).append(button);

        $("#" + buttonId).click(function () {
            $(".email-form").show();
            $(".overlay").show();
        });
    }

    function createEmailForm() {
        var emailForm = $("<div>", {
            class: "email-form",
            css: {
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: "1em",
                display: "none",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
                padding: "20px",
                border: "1px solid #ccc",
                zIndex: 1000,
                borderRadius: "8px",
                boxShadow: "rgba(0, 0, 0, 0.3) 0px 3px 8px",
                maxWidth: "45em",
                maxHeight: "45em",
                overflow: "auto"
            }
        });

        var closeButton = $("<button>", {
            class: "close-btn",
            css: {
                position: "absolute",
                top: "10px",
                right: "10px",
                cursor: "pointer",
                border: "none",
                borderRadius: "9999px",
                padding: "0.5em",
                fontWeight: "900",
                fontFamily: "Arial, Helvetica, sans-serif",
                fontSize: "0.7em",
                textTransform: "uppercase",
                color: EmailFormParameters.efCloseButtonTextColor,
                backgroundColor: EmailFormParameters.efCloseButtonBackgroundColor
            }
        }).html(EmailFormParameters.efCloseButtonText).on("click", function () {
            emailForm.hide();
            $(".overlay").hide();
        });

        var iframe = $("<iframe>", {
            src: createiFrameURL(EmailFormParameters),
            css: {
                width: "40em",
                height: "40em"
            },
            frameborder: "0"
        });

        emailForm.append(iframe, closeButton).appendTo("body");
    }

    if ($("#" + divId).length === 0) {
        $("<div>", {
            id: divId,
            css: {
                position: "absolute",
                right: "10px",
                bottom: "10px",
                display: "flex",
                flexDirection: "column",
                padding: "0 0 3em 0"
            }
        }).appendTo("body");

        createOverlay();
        createEmailFormButton();
        createEmailForm();

        $(".overlay").on("click", function () {
            $(".email-form").hide();
            $(".overlay").hide();
        });
    } else {
        createEmailFormButton();
        createEmailForm();

        $(".overlay").on("click", function () {
            $(".email-form").hide();
            $(".overlay").hide();
        });
    }
});
