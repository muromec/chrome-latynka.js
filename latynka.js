const State = {
    observer: null,
};

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

let Latynka = Array(
    Array("грунт","grunt"),
    Array("енерг","energ"),
    Array("гедз","gedz"),
    Array("гудз","gudz"),
    Array("реліг","relig"),
    Array("кг","kg"),
    Array("регіо","regio"),
    Array("а","a"),
    Array("б","b"),
    Array("в","v"),
    Array("г","h"),
    Array("ґ","g"),
    Array("дя","ďa"),
    Array("дє","ďe"),
    Array("дь","ď"),
    Array("дю","ďu"),
    Array("д","d"),
    Array("ж","ž"),
    Array("зя","źa"),
    Array("зє","źe"),
    Array("зь","ź"),
    Array("зю","źu"),
    Array("з","z"),
    Array("к","k"),
    Array("ля","ľa"),
    Array("лє","ľe"),
    Array("ль","ľ"),
    Array("лю","ľu"),
    Array("л","l"),
    Array("м","m"),
    Array("ня","ńa"),
    Array("нє","ńe"),
    Array("нь","ń"),
    Array("ню","ńu"),
    Array("н","n"),
    Array("о","o"),
    Array("п","p"),
    Array("ря","ŕa"),
    Array("рє","ŕe"),
    Array("рь","ŕ"),
    Array("рю","ŕu"),
    Array("р","r"),
    Array("ся","śa"),
    Array("сє","śe"),
    Array("сь","ś"),
    Array("сю","śu"),
    Array("с","s"),
    Array("тя","ťa"),
    Array("тє","ťe"),
    Array("ть","ť"),
    Array("тю","ťu"),
    Array("т","t"),
    Array("у","u"),
    Array("ф","f"),
    Array("х","x"),
    Array("ця","ća"),
    Array("цє","će"),
    Array("ць","ć"),
    Array("цю","ću"),
    Array("ц","c"),
    Array("ч","č"),
    Array("ш","š"),
    Array("щ","šč"),
    Array("и","y"),
    Array("ь",""),
    Array("'",""),
    Array("’",""),
    Array("і","i"),
    Array("е","e"),
    Array("ю","ju"),
    Array("й","j"),
    Array("є","je"),
    Array("ї","ji"),
    Array("ю","ju"),
    Array("я","ja")
).map(function (rule) {
    return {
        str: rule[0],
        from: new RegExp(rule[0], 'g'),
        to: rule[1],
    };
});
Latynka = Latynka.concat(Latynka.map(function (rule) {
    return {
        from: new RegExp(capitalize(rule.str), 'g'),
        to: capitalize(rule.to),
    };
}));

function translate(txt) {
    return Latynka.reduce(function (acc, rule) {
        return acc.replace(rule.from, rule.to);
    }, txt);
}

function revertNode(node) {
    const orig = node.latinizeorigtitle;
    if (orig) {
        node.textContent = orig;
    }
}

function translateNode(node) {
    if (!node.textContent.match(/[абвгґдеєжзиіїйклмнопрстуфхцчшщьюяАБВГДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯʼ'']/g)) {
        return;
    }

    if (State.force) {
        node.latinizeorigtitle = node.textContent;
        node.textContent = translate(node.textContent);
        return;
    }

    chrome.i18n.detectLanguage(node.textContent, function (result) {
        if (!result || !result.isReliable) { return; }
        const lang = result.languages[0];
        if (!lang) { return; }
        if (lang.language === 'uk') {
            node.textContent = translate(node.textContent);
        }
    });
}

function walker(node, cb) {
    if (!node) {
        return;
    }
    const it = document.createNodeIterator(node, NodeFilter.SHOW_TEXT);
    for (let txt = it.nextNode(); txt !== null; txt = it.nextNode()) {
        cb(txt);
    }
    it.detach();

}

function enable({force}) {
    if (!force && State.force) {
        disable();
    }
    State.force = force;
    if (State.observer) {
        State.observer.disconnect();
        State.observer = null;
    }

    if (document.body) {
        walker(document.body, translateNode);
    }

    const observer = new MutationObserver(function(mutations) {
        if (State.key === true) {
            return;
        }

        mutations.forEach(function(mutation) {
            walker(mutation.target, translateNode);
            for (let i = 0; i < mutation.addedNodes.length; i++) {
                const node = mutation.addedNodes[i]
                walker(node, translateNode);
            }
        })
    })

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        characterData: true,
    })

    State.observer = observer;

    return true;
}

function disable() {
    if (State.observer) {
        State.observer.disconnect();
        State.observer = null;
    }
    if (document.body) {
        walker(document.body, revertNode);
    }
}

(function () {

    document.documentElement.addEventListener('keydown', function() {
        State.key = true;
    });

    document.documentElement.addEventListener('keyup', function() {
        State.key = false;
    });

    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.cmd == "enable") {
            sendResponse({ret: enable(request.options)});
        }
        if (request.cmd == "disable") {
            sendResponse({ret: disable(request.options)});
        }

    });

    chrome.runtime.sendMessage({cmd: "query"}, function(response={}) {
        const {options} = response;
        if (!options) { return; };
        if (options.enabled) {
            enable(options);
        }
    });
})();
