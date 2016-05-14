const State = {
    inProgress: false,
};

function getOptions() {
    return {
        enabled: window.localStorage['enabled'] === 'true',
        force: window.localStorage['force'] === 'true',
    };
}


function resetUI() {
    const {enabled, force} = getOptions();
    const {inProgress} = State;

    const title = document.querySelector('h1');
    const switcher = document.querySelector('#force');

    title.innerText = inProgress ? 'Latynka...' : 'Latynka';
    title.style.textDecoration = enabled ? '' : 'line-through';
    switcher.innerText = force ? 'Latinize all' : 'Detect Ukrainian';
}

function cmd(name, options) { 
    State.inProgress = true;
    resetUI();
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {cmd: name, options}, function(response) {
        State.inProgress = false;
        resetUI();
      });
    });
}

function main() {
    const node = document.querySelector('h1');
    const force = document.querySelector('#force');

    resetUI();

    node.addEventListener('click', function () {
        const {enabled} = getOptions();

        if (enabled) {
            window.localStorage['enabled'] = false;
            cmd('disable');
        } else {
            window.localStorage['enabled'] = true;
            cmd('enable', getOptions());
        }
        resetUI();

    }, false);

    force.addEventListener('click', function () {
        const {force} = getOptions();

        if (force) {
            window.localStorage['force'] = false;
            cmd('enable', getOptions());
        }
        else {
            window.localStorage['force'] = true;
            cmd('enable', getOptions());
        }
        resetUI();
    });
}

document.addEventListener('DOMContentLoaded', main, false);
