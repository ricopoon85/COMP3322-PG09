import React from 'react';
import styles from './FormattingToolbar.module.css';

export default function FormattingToolbar({
  applyFormat,
  onOpenGuide,
  onImageUpload,
  onPrepareImageUpload,
}) {
  const imageInputRef = React.useRef(null);
  
  const getHighlightColor = (varName) => {
    return getComputedStyle(document.body).getPropertyValue(varName).trim();
  };

  return (
    <div className={styles.toolbar}>
      
      {/* HEADINGS */}
      <button 
        type="button" 
        onClick={() => applyFormat('formatBlock', '<h1>')} 
        className={styles.toolBtn}
        style={{ fontSize: '1.2rem', fontWeight: 'bold' }}
        title="Title"
      >
        Title
      </button>
      
      <button 
        type="button" 
        onClick={() => applyFormat('formatBlock', '<h2>')} 
        className={styles.toolBtn}
        style={{ fontSize: '1.05rem', fontWeight: 'bold' }}
        title="Heading"
      >
        Heading
      </button>
      
      <button 
        type="button" 
        onClick={() => applyFormat('formatBlock', '<h3>')} 
        className={styles.toolBtn}
        style={{ fontSize: '0.95rem', fontWeight: 'bold' }}
        title="Subheading"
      >
        Sub
      </button>
      
      <button 
        type="button" 
        onClick={() => applyFormat('formatBlock', '<p>')} 
        className={styles.toolBtn}
        style={{ fontSize: '0.8rem', fontWeight: 'normal' }}
        title="Body Text"
      >
        Body
      </button>
      <div className={styles.divider}></div>

      {/* FONTS */}
      <button 
        type="button" 
        onClick={() => applyFormat('fontName', 'system-ui, sans-serif')} 
        className={styles.toolBtn}
        style={{ fontFamily: 'system-ui, sans-serif' }}
      >
        Sans
      </button>
      
      <button 
        type="button" 
        onClick={() => applyFormat('fontName', 'Georgia, serif')} 
        className={styles.toolBtn}
        style={{ fontFamily: 'Georgia, serif' }}
      >
        Serif
      </button>
      
      <button 
        type="button" 
        onClick={() => applyFormat('fontName', 'monospace')} 
        className={styles.toolBtn}
        style={{ fontFamily: 'monospace' }}
      >
        Mono
      </button>

      <div className={styles.divider}></div>

      {/* TEXT STYLES */}
      <button type="button" onClick={() => applyFormat('bold')} className={styles.toolBtn}><b>B</b></button>
      <button type="button" onClick={() => applyFormat('italic')} className={styles.toolBtn}><i>I</i></button>
      <button type="button" onClick={() => applyFormat('underline')} className={styles.toolBtn}><u>U</u></button>
      <button type="button" onClick={() => applyFormat('strikeThrough')} className={styles.toolBtn}><s>S</s></button>

      <div className={styles.divider}></div>

      {/* LISTS */}
      <button type="button" onClick={() => applyFormat('insertUnorderedList')} className={styles.toolBtn}>• List</button>
      <button type="button" onClick={() => applyFormat('insertOrderedList')} className={styles.toolBtn}>1. List</button>

      <div className={styles.divider}></div>

      {/* HIGHLIGHTERS */}
      <div className={styles.colorGroup}>
        <button type="button" onClick={() => applyFormat('hiliteColor', getHighlightColor('--hl-yellow'))} className={styles.colorBtn} style={{backgroundColor: 'var(--hl-yellow)'}} title="Yellow"></button>
        <button type="button" onClick={() => applyFormat('hiliteColor', getHighlightColor('--hl-green'))} className={styles.colorBtn} style={{backgroundColor: 'var(--hl-green)'}} title="Green"></button>
        <button type="button" onClick={() => applyFormat('hiliteColor', getHighlightColor('--hl-cyan'))} className={styles.colorBtn} style={{backgroundColor: 'var(--hl-cyan)'}} title="Cyan"></button>
        <button type="button" onClick={() => applyFormat('hiliteColor', getHighlightColor('--hl-pink'))} className={styles.colorBtn} style={{backgroundColor: 'var(--hl-pink)'}} title="Pink"></button>
        <button type="button" onClick={() => applyFormat('hiliteColor', getHighlightColor('--hl-red'))} className={styles.colorBtn} style={{backgroundColor: 'var(--hl-red)'}} title="Red"></button>
        <button type="button" onClick={() => applyFormat('hiliteColor', 'transparent')} className={styles.colorBtn} style={{backgroundColor: 'transparent', border: '1px solid var(--color-text)'}} title="Remove Highlight"></button>
      </div>

      {onImageUpload && (
        <>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) onImageUpload(file);
            }}
          />
          <button
            type="button"
            className={styles.toolBtn}
            onMouseDown={onPrepareImageUpload}
            onClick={() => imageInputRef.current?.click()}
            title="Insert image"
          >
            Image
          </button>
        </>
      )}

      {onOpenGuide && (
        <button
          type="button"
          className={`${styles.toolBtn} ${styles.guideButton}`}
          onClick={onOpenGuide}
        >
          Formatting Guide
        </button>
      )}

    </div>
  );
}