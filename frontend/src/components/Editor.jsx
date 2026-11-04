import { useEffect, useState, useRef } from 'react';
import styles from './Editor.module.css';
import FormattingToolbar from './FormattingToolbar';

export default function Editor({ note, searchQuery = '', onTitleChange, onContentChange }) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [isLightMode, setIsLightMode] = useState(true);
  const editorRef = useRef(null);

  useEffect(() => {
    setTitle(note?.title || '');
    setContent(note?.content || '');
    if (editorRef.current && note?.content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = note?.content || '';
    }
  }, [note?.id]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const removeSearchHighlights = () => {
      editor.querySelectorAll(`.${styles.searchHighlight}`).forEach((mark) => {
        mark.replaceWith(document.createTextNode(mark.textContent));
      });
      editor.normalize();
    };

    removeSearchHighlights();
    const query = searchQuery.trim();
    if (!query) return;

    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const matcher = new RegExp(escapedQuery, 'gi');

    textNodes.forEach((textNode) => {
      if (!textNode.data || textNode.parentElement?.closest(`.${styles.searchHighlight}`)) return;
      const fragments = [];
      let lastIndex = 0;
      let match;

      matcher.lastIndex = 0;
      while ((match = matcher.exec(textNode.data)) !== null) {
        fragments.push(document.createTextNode(textNode.data.slice(lastIndex, match.index)));
        const mark = document.createElement('mark');
        mark.className = styles.searchHighlight;
        mark.textContent = match[0];
        fragments.push(mark);
        lastIndex = match.index + match[0].length;
      }
      if (!fragments.length) return;
      fragments.push(document.createTextNode(textNode.data.slice(lastIndex)));
      textNode.replaceWith(...fragments);
    });

    return removeSearchHighlights;
  }, [searchQuery, note?.id, note?.content]);

  useEffect(() => {
    if (!note) return;
    const timer = setTimeout(() => {
      if (title !== note.title) onTitleChange(title);
    }, 500);
    return () => clearTimeout(timer);
  }, [title, note, onTitleChange]);

  useEffect(() => {
    if (!note) return;
    const timer = setTimeout(() => {
      if (content !== note.content) onContentChange(content);
    }, 500);
    return () => clearTimeout(timer);
  }, [content, note, onContentChange]);

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();

    if (command === 'insertOrderedList' || command === 'insertUnorderedList') {
      placeCaretInListItem(window.getSelection());
    }

    updateContentState();
  };

  const toggleTheme = () => {
    const newMode = !isLightMode;
    setIsLightMode(newMode);
    
    if (newMode) {
      document.body.classList.remove('dark-mode');
    } else {
      document.body.classList.add('dark-mode');
    }
  };

  const handleKeyDown = (e) => {
    const editor = editorRef.current;
    if (!editor) return;

    if (e.metaKey || e.ctrlKey) {
      if (e.key === 'b') {
        e.preventDefault();
        applyFormat('bold');
        return;
      }
      if (e.key === 'i') {
        e.preventDefault();
        applyFormat('italic');
        return;
      }
      if (e.key === 'u') {
        e.preventDefault();
        applyFormat('underline');
        return;
      }
      if (e.key === 's') {
        e.preventDefault();
        applyFormat('strikethrough');
        return;
      }
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '    ');
      updateContentState();
      return;
    }

    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const textBeforeCursor = range.startContainer.textContent.slice(0, range.startOffset);

    if (e.key === ' ' && /^[-*]$/.test(textBeforeCursor)) {
      e.preventDefault();

      range.setStart(range.startContainer, Math.max(0, range.startOffset - 1));
      range.deleteContents();
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('insertUnorderedList');
      placeCaretInListItem(selection);
      updateContentState();
      return;
    }

    if (e.key === ' ' && /^\d+\.$/.test(textBeforeCursor)) {
      e.preventDefault();

      range.setStart(range.startContainer, Math.max(0, range.startOffset - textBeforeCursor.length));
      range.deleteContents();
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand('insertOrderedList');
      placeCaretInListItem(selection);
      updateContentState();
      return;
    }

    if (e.key === ' ' && textBeforeCursor.endsWith('[]')) {
      e.preventDefault();
      range.setStart(range.startContainer, Math.max(0, range.startOffset - 2)); 
      range.deleteContents();
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.contentEditable = false;
      range.insertNode(checkbox);
      const space = document.createTextNode(' ');
      checkbox.after(space);
      range.setStartAfter(space);
      range.setEndAfter(space);
      selection.removeAllRanges();
      selection.addRange(range);
      updateContentState();
      return;
    }

    const trailingDashMatch = textBeforeCursor.match(/-{3,}$/);
    if (e.key === 'Enter' && trailingDashMatch) {
      e.preventDefault();

      range.setStart(
        range.startContainer,
        Math.max(0, range.startOffset - trailingDashMatch[0].length)
      );
      range.deleteContents();

      const hr = document.createElement('hr');
      range.insertNode(hr);
      const br = document.createElement('br');
      hr.after(br);
      range.setStartAfter(br);
      range.setEndAfter(br);
      selection.removeAllRanges();
      selection.addRange(range);
      updateContentState();
      return;
    }

    const listItem = range.startContainer.nodeType === Node.TEXT_NODE
      ? range.startContainer.parentElement?.closest('li')
      : range.startContainer.closest?.('li');
    if (e.key === 'Enter' && listItem) {
      e.preventDefault();
      const list = listItem.parentElement;
      const isEmpty = listItem.textContent.trim() === '' && !listItem.querySelector('input[type="checkbox"]');

      if (isEmpty) {
        const nextAfterList = list.nextSibling;
        const parent = list.parentNode;
        listItem.remove();
        if (!list.children.length) list.remove();
        const line = document.createElement('div');
        line.appendChild(document.createElement('br'));
        if (nextAfterList?.parentNode === parent) {
          parent.insertBefore(line, nextAfterList);
        } else if (parent?.isConnected) {
          parent.insertBefore(line, null);
        } else {
          editor.appendChild(line);
        }
        range.setStart(line, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        updateContentState();
        return;
      }

      const trailingRange = document.createRange();
      trailingRange.setStart(range.startContainer, range.startOffset);
      trailingRange.setEnd(listItem, listItem.childNodes.length);
      const trailingContent = trailingRange.extractContents();

      const newItem = document.createElement('li');
      if (trailingContent.childNodes.length) {
        newItem.appendChild(trailingContent);
      } else {
        newItem.appendChild(document.createElement('br'));
      }
      listItem.after(newItem);

      range.setStart(newItem, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      updateContentState();
      return;
    }

    if (e.key === 'Enter' && hasCheckboxInCurrentLine(range)) {
      e.preventDefault();
      insertLineAfterCheckbox(range, selection);
      updateContentState();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      insertDefaultParagraphAfterCaret(range, selection);
      updateContentState();
    }
  };

  const placeCaretInListItem = (selection) => {
    if (!selection) return;

    const findListItem = () => {
      let node = selection.anchorNode;
      if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement;
      let listItem = node?.closest?.('li');
      return listItem;
    };

    const placeCaret = () => {
      const listItem = findListItem();
      if (!listItem) return;

      const caret = document.createRange();
      caret.selectNodeContents(listItem);
      caret.collapse(false);
      
      selection.removeAllRanges();
      selection.addRange(caret);
      editorRef.current.focus();
    };

    placeCaret();
    requestAnimationFrame(placeCaret); 
  };

  const hasCheckboxInCurrentLine = (range) => {
    const startNode = range.startContainer.nodeType === Node.ELEMENT_NODE
      ? range.startContainer
      : range.startContainer.parentElement;
    let current = startNode;
    while (current && current !== editorRef.current) {
      if (current.querySelector?.('input[type="checkbox"]')) return true;
      if (current.parentElement === editorRef.current && current.contains?.(startNode)) return current.querySelector('input[type="checkbox"]');
      current = current.parentElement;
    }
    return false;
  };

  const insertLineAfterCheckbox = (range, selection) => {
    let current = range.startContainer.nodeType === Node.ELEMENT_NODE
      ? range.startContainer
      : range.startContainer.parentElement;

    while (current?.parentElement && current.parentElement !== editorRef.current) {
      current = current.parentElement;
    }

    const textContent = current.textContent.trim();
    
    if (textContent === '') {
      const emptyLine = document.createElement('p');
      emptyLine.appendChild(document.createElement('br'));
      current.after(emptyLine);
      
      current.remove(); 
      
      range.setStart(emptyLine, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    const newLine = document.createElement('p');
    const newCheckbox = document.createElement('input');
    newCheckbox.type = 'checkbox';
    newCheckbox.contentEditable = false;
    newCheckbox.style.marginRight = '8px';
    
    newLine.appendChild(newCheckbox);
    newLine.appendChild(document.createTextNode(' '));
    
    current.after(newLine);

    range.setStart(newLine, 1); 
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const insertDefaultParagraphAfterCaret = (range, selection) => {
    const block = range.startContainer.nodeType === Node.ELEMENT_NODE
      ? range.startContainer.closest('h1, h2, h3, p, div')
      : range.startContainer.parentElement?.closest('h1, h2, h3, p, div');

    if (block && block !== editorRef.current && range.collapsed) {
      const after = document.createRange();
      after.setStart(range.startContainer, range.startOffset);
      after.setEnd(block, block.childNodes.length);
      const trailingContent = after.extractContents();

      const paragraph = document.createElement('p');
      paragraph.appendChild(document.createElement('br'));
      block.after(paragraph);

      if (trailingContent.childNodes.length && trailingContent.textContent) {
        paragraph.textContent = '';
        paragraph.appendChild(trailingContent);
      }

      if (!paragraph.textContent) {
        range.setStartAfter(paragraph.firstChild);
      } else {
        range.selectNodeContents(paragraph);
        range.collapse(false);
      }
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    const br = document.createElement('br');
    range.insertNode(br);
    range.setStartAfter(br);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const moveCaretOutOfHighlight = (range, selection) => {
    if (!range.collapsed || range.startContainer.nodeType !== Node.TEXT_NODE) return;

    const textNode = range.startContainer;
    let highlighted = textNode.parentElement;
    while (highlighted && highlighted !== editorRef.current) {
      const style = window.getComputedStyle(highlighted);
      if (style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent') break;
      highlighted = highlighted.parentElement;
    }
    if (!highlighted || highlighted === editorRef.current) return;

    const parent = highlighted.parentNode;
    const offset = range.startOffset;
    const plainBefore = offset === 0;
    const plainAfter = offset === textNode.length;

    if (!plainBefore && !plainAfter) {
      const afterText = textNode.splitText(offset);
      const highlightedAfter = highlighted.cloneNode(false);
      highlightedAfter.appendChild(afterText);
      parent.insertBefore(highlightedAfter, highlighted.nextSibling);
    }

    const plainCaret = document.createTextNode('\u200B');
    if (plainBefore) parent.insertBefore(plainCaret, highlighted);
    else if (plainAfter) parent.insertBefore(plainCaret, highlighted.nextSibling);
    else parent.insertBefore(plainCaret, highlighted.nextSibling);

    range.setStart(plainCaret, plainCaret.length);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const handleEditorClick = (e) => {
    if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
      updateContentState();
    }
  };

  const updateContentState = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  if (!note) return null;
  const readOnly = note.shared && !note.canEdit;

  return (
    <main className={styles.editor}>
      <FormattingToolbar 
        applyFormat={applyFormat} 
        toggleTheme={toggleTheme} 
        isLightMode={isLightMode} 
      />

      <input
        className={styles.titleInput}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        disabled={readOnly}
      />
      
      <div
        ref={editorRef}
        className={`scroll-container ${styles.textarea}`}
        contentEditable={!readOnly}
        onInput={(e) => setContent(e.currentTarget.innerHTML)}
        onKeyDown={handleKeyDown}
        onClick={handleEditorClick}
        placeholder="Start writing..."
        suppressContentEditableWarning={true}
      />
    </main>
  );
}