import {
    lineNumbers,
    highlightActiveLineGutter,
    highlightSpecialChars,
    drawSelection,
    dropCursor,
    rectangularSelection,
    crosshairCursor,
    highlightActiveLine,
    keymap,
} from '@codemirror/view'
import { EditorView } from '@codemirror/view'
export { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import {
    foldGutter,
    indentOnInput,
    syntaxHighlighting,
    defaultHighlightStyle,
    bracketMatching,
    foldKeymap,
} from '@codemirror/language'
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands'
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search'
import { closeBrackets, autocompletion, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete'
import { lintKeymap, lintGutter } from '@codemirror/lint'
import { PromptKeymap1 } from './COMMANDS'
import { oneDark } from '@codemirror/theme-one-dark'
import { placeholders } from './DECORATION'
import { simpleLezerLinter } from './LINT2'

export const basicSetup = (() => [
    EditorView.lineWrapping,
    simpleLezerLinter(),
    lintGutter(),
    placeholders,
    oneDark,
    lineNumbers(),
    PromptKeymap1(),
    highlightActiveLineGutter(),
    highlightSpecialChars(),
    history(),
    // foldGutter(),
    drawSelection(),
    dropCursor(),
    EditorState.allowMultipleSelections.of(true),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    bracketMatching(),
    closeBrackets(),
    autocompletion(),
    rectangularSelection(),
    crosshairCursor(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...lintKeymap,
    ]),
])()
