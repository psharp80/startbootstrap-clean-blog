$(document).ready(function () {
    var divId = "pluginButtonContainer";
    var buttonId = "btnCallMeBack";

    function setupIntlTelInput() {
        const input = document.querySelector("#phoneNumber");
        var iti = window.intlTelInput(input, {
            utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@22.0.2/build/js/utils.js",
            initialCountry: "auto",
            separateDialCode: true,
            geoIpLookup: function (success, failure) {
                $.get("https://ipinfo.io", function () { }, "jsonp").always(function (resp) {
                    var countryCode = (resp && resp.country) ? resp.country : "";
                    success(countryCode);
                    document.cookie = "country-code=" + countryCode;
                });
            }
        });

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (iti) {
                    resolve(iti);
                } else {
                    reject("intlTelInput not initialized");
                }
            }, 1000);
        });
    }

    function bindFormEvent(iti) {
        $("#callMeBackForm").on("submit", function (event) {
            event.preventDefault();

            var submitButton = $(this).find("button[type='submit']");
            submitButton.text("Please wait...").prop("disabled", true);

            var countryCode = getCookie("country-code");
            var url = `https://api.five9.eu/web2campaign/AddToList?` +
                `F9domain=${encodeURIComponent($("#domain").val())}` +
                `&F9list=${encodeURIComponent($("#list").val())}` +
                `&Full%20Name=${encodeURIComponent($("#firstName").val() + " " + $("#lastName").val())}` +
                `&number1=${encodeURIComponent(iti.getNumber())}` +
                `&F9CountryCode=${encodeURIComponent(countryCode)}` +
                `&F9retResults=1&F9retURL=&F9CallASAP=true`;

            if (CallMeParameters.cmEmailRequired) {
                url += `&email=${encodeURIComponent($("#emailAddress").val())}`;
            }

            $.ajax({
                url: url,
                success: function (data) {
                    $(".popup-form").hide();
                    $(".overlay").hide();
                    submitButton.text(CallMeParameters.cmSubmitButtonText).prop("disabled", false);
                },
                error: function () {
                    alert("An error occurred submitting the form. Please try again.");
                    submitButton.text(CallMeParameters.cmSubmitButtonText).prop("disabled", false);
                }
            });
        });
    }

    function getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
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

    function createCallMeButton() {
        var svgIcon = "<svg xmlns='http://www.w3.org/2000/svg' height='28px' viewBox='0 -960 960 960' width='28px' fill='#e8eaed'><path d='M162-120q-18 0-30-12t-12-30v-162q0-13 9-23.5t23-14.5l138-28q14-2 28.5 2.5T342-374l94 94q38-22 72-48.5t65-57.5q33-32 60.5-66.5T681-524l-97-98q-8-8-11-19t-1-27l26-140q2-13 13-22.5t25-9.5h162q18 0 30 12t12 30q0 125-54.5 247T631-329Q531-229 409-174.5T162-120Zm556-480q17-39 26-79t14-81h-88l-18 94 66 66ZM360-244l-66-66-94 20v88q41-3 81-14t79-28Zm358-356ZM360-244Z'/></svg>";
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
            $(".popup-form").show();
            $(".overlay").show();
        });
    }

    function createCallMeForm() {
        var popupForm = $("<div>", {
            class: "popup-form",
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
                border: "none",
                borderRadius: "8px",
                boxShadow: "rgba(255, 255, 255, 0.15) 0px 3px 3px 0px",
                maxWidth: "30em",
                backgroundImage: "url('" + CallMeParameters.cmBackgroundImage + "')",
                backgroundSize: "cover"
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
                color: CallMeParameters.cmCloseButtonTextColor,
                backgroundColor: CallMeParameters.cmCloseButtonBackgroundColor
            }
        }).html(CallMeParameters.cmCloseButtonText).on("click", function () {
            popupForm.hide();
            $(".overlay").hide();
        });

        var form = $("<form>", {
            id: "callMeBackForm"
        });

        var domainHiddenField = $("<div>").append(
            $("<input id='domain' name='domain' hidden value='" + CallMeParameters.cmDomain + "'>", {
                type: "text",
                required: true
            })
        );

        var listHiddenField = $("<div>").append(
            $("<input id='list' name='list' hidden value='" + CallMeParameters.cmList + "'>", {
                type: "text",
                required: true
            })
        );

        var helperText = $("<div>", {
            css: {
                fontSize: "1.3em",
                fontWeight: "bolder",
                padding: "1.5em 0 1em 0",
                color: CallMeParameters.cmHeaderTextColor
            }
        }).text(CallMeParameters.cmHeaderText);

        var fullNameField = $("<div>", {
            css: {
                display: "flex",
                margin: "0 0 1em 0"
            }
        }).append(
            $("<input>", {
                type: "text",
                id: "firstName",
                name: "firstName",
                placeholder: "First Name",
                required: true,
                css: {
                    maxHeight: "3em",
                    minHeight: "2.5em",
                    border: "1px solid #000000",
                    borderRadius: "4px",
                    fontSize: "1em",
                    flex: 1
                }
            }),
            $("<input>", {
                type: "text",
                id: "lastName",
                name: "lastName",
                placeholder: "Last Name",
                required: true,
                css: {
                    maxHeight: "3em",
                    minHeight: "2.5em",
                    border: "1px solid #000000",
                    borderRadius: "4px",
                    margin: "0 0 0 1em",
                    fontSize: "1em",
                    flex: 1
                }
            })
        );
        var phoneField = $("<div>", {
            css: {
                display: "flex",
                margin: "0 0 1em 0"
            }
        }).append(
            $("<input>", {
                type: "tel",
                id: "phoneNumber",
                name: "phoneNumber",
                required: true,
                css: {
                    maxHeight: "3em",
                    minHeight: "2.5em",
                    border: "1px solid #000000",
                    borderRadius: "4px",
                    fontSize: "1em",
                    flex: 1
                }
            })
        );

        form.append(domainHiddenField, listHiddenField, helperText, fullNameField, phoneField);

        if (CallMeParameters.cmEmailRequired) {
            var emailField = $("<div>", {
                css: {
                    display: "flex",
                    margin: "0 0 1em 0"
                }
            }).append(
                $("<input>", {
                    type: "email",
                    id: "emailAddress",
                    name: "emailAddress",
                    placeholder: "Email Address",
                    required: true,
                    css: {
                        maxHeight: "3em",
                        minHeight: "2.5em",
                        border: "1px solid #000000",
                        borderRadius: "4px",
                        fontSize: "1em",
                        flex: 1
                    }
                })
            );
            form.append(emailField);
        }

        var submitButtonField = $("<div>", {
            css: {
                display: "flex",
                margin: "0 0 1em 0"
            }
        }).append(
            $("<button>", {
                type: "submit",
                css: {
                    cursor: "pointer",
                    border: "none",
                    borderRadius: "9999px",
                    padding: "0.5em 1em",
                    fontWeight: "900",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: "1em",
                    textTransform: "uppercase",
                    color: CallMeParameters.cmSubmitButtonTextColor,
                    backgroundColor: CallMeParameters.cmSubmitButtonBackgroundColor
                }
            }).text(CallMeParameters.cmSubmitButtonText)
        );

        form.append(submitButtonField);
        popupForm.append(form, closeButton).appendTo("body");
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
        createCallMeButton();
        createCallMeForm();

        setupIntlTelInput().then(iti => {
            bindFormEvent(iti);
            $(".iti.iti--allow-dropdown.iti--show-flags.iti--inline-dropdown").css({
                display: "flex",
                flex: 1,
                maxHeight: "3em",
                minHeight: "2.5em"
            });
        }).catch(error => console.error(error));

        $(".overlay").on("click", function () {
            $(".popup-form").hide();
            $(".overlay").hide();
        });
    } else {
        createCallMeButton();
        createCallMeForm();

        setupIntlTelInput().then(iti => {
            bindFormEvent(iti);
        }).catch(error => console.error(error));

        $(".overlay").on("click", function () {
            $(".popup-form").hide();
            $(".overlay").hide();
        });
    }
});