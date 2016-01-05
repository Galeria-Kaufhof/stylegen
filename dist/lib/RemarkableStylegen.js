'use strict';

function stylegenBlock(engine) {
    return function (state, startLine, endLine, silent) {
        var marker,
            len,
            params,
            nextLine,
            mem,
            haveEndMarker = false,
            pos = state.bMarks[startLine] + state.tShift[startLine],
            max = state.eMarks[startLine];
        /** if line is shorter that 3 chars omit */
        if (pos + 3 > max) {
            return false;
        }
        marker = state.src.charCodeAt(pos);
        /** if marker doesn't start with character leave */
        if (marker !== 0x5B /* [ */) {
                return false;
            }
        // scan marker length
        mem = pos;
        pos = state.skipChars(pos, marker);
        len = pos - mem;
        if (len < 3) {
            return false;
        }
        params = state.src.slice(pos, max).trim();
        if (params.indexOf('[') >= 0) {
            return false;
        }
        // Since start is found, we can report success here in validation mode
        if (silent) {
            return true;
        }
        // search end of block
        nextLine = startLine;
        while (true) {
            nextLine++;
            if (nextLine >= endLine) {
                // unclosed block should be autoclosed by end of document.
                // also block seems to be autoclosed by end of parent
                break;
            }
            pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
            max = state.eMarks[nextLine];
            if (pos < max && state.tShift[nextLine] < state.blkIndent) {
                // non-empty line with negative indent should stop the list:
                // - ```
                //  test
                break;
            }
            if (state.src.charCodeAt(pos) !== marker) {
                continue;
            }
            if (state.tShift[nextLine] - state.blkIndent >= 4) {
                // closing fence should be indented less than 4 spaces
                continue;
            }
            pos = state.skipChars(pos, marker);
            // closing code fence must be at least as long as the opening one
            if (pos - mem < len) {
                continue;
            }
            // make sure tail has spaces only
            pos = state.skipSpaces(pos);
            if (pos < max) {
                continue;
            }
            haveEndMarker = true;
            // found!
            break;
        }
        // If a fence has heading spaces, they should be removed from its inner block
        len = state.tShift[startLine];
        state.line = nextLine + (haveEndMarker ? 1 : 0);
        state.tokens.push({
            type: 'htmlblock',
            params: params,
            content: engine.compile(state.getLines(startLine + 1, nextLine - 1, len, true))({}),
            lines: [startLine, state.line],
            level: state.level
        });
        return true;
    };
}
function stylegenInline(engine) {
    return function (state, silent) {
        var start,
            max,
            marker,
            matchStart,
            matchEnd,
            pos = state.pos,
            ch = state.src.charCodeAt(pos),
            closed = false;
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
                } else {
                closed = true;
                break;
            }
        }
        // closed brackets found, lets look for the prefix
        if (!!closed) {
            marker = state.src.slice(start + 1, pos);
            var stylegenTag = marker.trim().match(/^upl\ (.+)/);
            if (stylegenTag) {
                if (!silent) {
                    state.push({
                        type: 'htmlblock',
                        content: engine.compile(stylegenTag[1])({}),
                        block: false,
                        level: --state.level
                    });
                    state.pending += "";
                }
                state.pos += marker.length + 2;
            } else {
                return false;
            }
            return true;
        } else {
            state.pos = start;
            return false;
        }
    };
}
function RemarkableStylegen(engine) {
    return function (md) {
        if (!!engine) {
            md.meta = md.meta || {};
            md.block.ruler.before('code', 'stylegen', stylegenBlock(engine), { alt: [] });
            md.inline.ruler.before('text', 'stylegen', stylegenInline(engine), { alt: [] });
        }
    };
}
exports.RemarkableStylegen = RemarkableStylegen;
;