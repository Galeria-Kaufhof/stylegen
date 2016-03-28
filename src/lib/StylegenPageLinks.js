function inlinePageLinks(htmlEngine, linkRegistry) {
    return function (state, silent) {
        var start, max, marker, matchStart, matchEnd, pos = state.pos, ch = state.src.charCodeAt(pos), closed = false;
        // look forward to a potential start
        if (ch !== 0x5B /* [ */) {
            return false;
        }
        start = pos;
        pos++;
        max = state.posMax;
        while (pos < max) {
            if (state.src.charCodeAt(pos) !== 0x5D /* ] */) {
                pos++;
            }
            else {
                closed = true;
                break;
            }
        }
        // closed brackets found, lets look for the prefix
        if (!!closed) {
            marker = state.src.slice(start + 1, pos);
            var stylegenTag = marker.trim().match(/^sglink\ (.+?)\ \|\ (.+?)$/);
            if (stylegenTag) {
                var regsitryLink = linkRegistry.find(`page-${stylegenTag[1]}`);
                var label = stylegenTag[2];
                var linkTemplate = `{{> sgintern.page_link this }}`;
                if (!silent) {
                    state.push({
                        type: 'htmlblock',
                        content: htmlEngine.compile(linkTemplate)(Object.assign(regsitryLink.context, { link: regsitryLink.link, label: label })),
                        block: false,
                        level: --state.level
                    });
                    state.pending += "";
                }
                state.pos += marker.length + 2;
            }
            else {
                return false;
            }
            return true;
        }
        else {
            state.pos = start;
            return false;
        }
    };
}
export function StylegenPageLinks(htmlEngine, linkRegistry) {
    return function (md) {
        if (htmlEngine && linkRegistry) {
            md.meta = md.meta || {};
            md.inline.ruler.before('text', 'stylegen', inlinePageLinks(htmlEngine, linkRegistry), { alt: [] });
        }
    };
}
;
