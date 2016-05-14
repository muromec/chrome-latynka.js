function getOptions() {
    return {
        enabled: window.localStorage['enabled'] === 'true',
        force: window.localStorage['force'] === 'true',
    };
}

function main() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.cmd == "query") {
            sendResponse({options: getOptions()});
        }
    });
}

main();
