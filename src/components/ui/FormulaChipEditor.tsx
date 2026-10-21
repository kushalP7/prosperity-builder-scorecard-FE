import React, { useState, useMemo, useRef } from 'react';
import { X, Code2, Sparkles, Wand2 } from 'lucide-react';
import { Button } from './button';

export interface FormulaTokenDef {
  name: string;
  token: string;
}

interface ParsedToken {
  id: string;
  type: 'column' | 'operator' | 'number' | 'function' | 'text';
  raw: string;
  label: string;
  colName?: string;
}

export interface FormulaChipEditorProps {
  value: string;
  onChange: (value: string) => void;
  availableTokens: FormulaTokenDef[];
  placeholder?: string;
  defaultExpression?: string;
  className?: string;
}

/**
 * Normalizes formula string with clean, readable spaces around operators and parentheses.
 * Ensures expressions like "Value * (Data *Data ) * 10" become "Value * ( Data * Data ) * 10".
 */
export function normalizeFormulaSpacing(expr: string): string {
  if (!expr) return '';
  return expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    // Spaces around operators +, -, *, /, %, ^
    .replace(/\s*([+\-*/%^])\s*/g, ' $1 ')
    // Spaces around parentheses
    .replace(/\(\s*/g, '( ')
    .replace(/\s*\)/g, ' )')
    // Remove space inside empty parentheses
    .replace(/\(\s*\)/g, '()')
    // Collapse multi-spaces
    .replace(/\s+/g, ' ')
    .trim();
}

export function FormulaChipEditor({
  value,
  onChange,
  availableTokens,
  placeholder = 'e.g. Weight * Value',
  defaultExpression = 'Weight * Value',
  className = '',
}: FormulaChipEditorProps) {
  const [viewMode, setViewMode] = useState<'chips' | 'raw'>('chips');
  const [inlineInput, setInlineInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Tokenize the formula expression into structured items
  const parsedTokens = useMemo(() => {
    if (!value || !value.trim()) return [];

    const tokenMap = new Map<string, FormulaTokenDef>();
    availableTokens.forEach(t => {
      tokenMap.set(t.token.toLowerCase(), t);
      const normalizedName = t.name.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
      if (!tokenMap.has(normalizedName)) {
        tokenMap.set(normalizedName, t);
      }
    });

    // Match numbers, operators, identifiers, or other symbols
    const regex = /(\d+(?:\.\d+)?)|([+\-*/(),%^])|([a-zA-Z_][a-zA-Z0-9_]*)|(\S+)/g;
    const result: ParsedToken[] = [];
    let match: RegExpExecArray | null;
    let idx = 0;

    while ((match = regex.exec(value)) !== null) {
      const raw = match[0];
      const key = raw.toLowerCase();

      if (tokenMap.has(key)) {
        const def = tokenMap.get(key)!;
        result.push({
          id: `token-${idx++}-${raw}`,
          type: 'column',
          raw,
          label: def.name || def.token,
          colName: def.name,
        });
      } else if (/^[+\-*/(),%^]$/.test(raw)) {
        result.push({
          id: `token-${idx++}-${raw}`,
          type: 'operator',
          raw,
          label: raw,
        });
      } else if (/^\d+(\.\d+)?$/.test(raw)) {
        result.push({
          id: `token-${idx++}-${raw}`,
          type: 'number',
          raw,
          label: raw,
        });
      } else if (/^(if|min|max|round|abs|sum|avg|sqrt)$/i.test(raw)) {
        result.push({
          id: `token-${idx++}-${raw}`,
          type: 'function',
          raw,
          label: raw.toUpperCase(),
        });
      } else {
        result.push({
          id: `token-${idx++}-${raw}`,
          type: 'text',
          raw,
          label: raw,
        });
      }
    }

    return result;
  }, [value, availableTokens]);

  const commitInlineInput = () => {
    const trimmed = inlineInput.trim();
    if (!trimmed) return;
    const combined = value ? `${value} ${trimmed}` : trimmed;
    onChange(normalizeFormulaSpacing(combined));
    setInlineInput('');
  };

  const handleInlineKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitInlineInput();
    } else if (e.key === 'Backspace' && inlineInput === '' && parsedTokens.length > 0) {
      e.preventDefault();
      handleRemoveToken(parsedTokens.length - 1);
    }
  };

  const handleRemoveToken = (indexToRemove: number) => {
    const remaining = parsedTokens.filter((_, idx) => idx !== indexToRemove);
    const newExpr = remaining
      .map(t => t.raw)
      .join(' ');
    onChange(normalizeFormulaSpacing(newExpr));
  };

  const handleToggleViewMode = () => {
    if (inlineInput.trim()) {
      commitInlineInput();
    }
    setViewMode(prev => {
      const next = prev === 'chips' ? 'raw' : 'chips';
      // Format spacing whenever entering raw view so it always looks clean
      onChange(normalizeFormulaSpacing(value));
      return next;
    });
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">Custom Expression:</span>
          <span className="text-[10px] text-muted-foreground/75 font-normal">
            {viewMode === 'chips' ? '(Interactive Chip View — Click to type)' : '(Raw Text View)'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(normalizeFormulaSpacing(value))}
            className="text-[11px] h-6 px-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Clean & standardize formula spacing"
          >
            <Wand2 className="w-3 h-3 mr-1 text-slate-500" />
            Format
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleToggleViewMode}
            className="text-[11px] h-6 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {viewMode === 'chips' ? (
              <>
                <Code2 className="w-3 h-3 mr-1 text-slate-500" />
                Raw Text
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 mr-1 text-[#B5111B]" />
                Chip View
              </>
            )}
          </Button>
          <button
            type="button"
            onClick={() => {
              setInlineInput('');
              onChange('');
            }}
            className="text-[11px] text-muted-foreground hover:text-red-500 px-2 py-0.5 transition-colors cursor-pointer"
          >
            Clear
          </button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer text-[11px] h-6 px-2"
            onClick={() => {
              setInlineInput('');
              onChange(normalizeFormulaSpacing(defaultExpression));
            }}
          >
            Reset to Default
          </Button>
        </div>
      </div>

      {viewMode === 'chips' ? (
        <div
          onClick={() => inputRef.current?.focus()}
          className="w-full min-h-[92px] rounded-md border border-input bg-background/60 p-2.5 text-xs shadow-2xs focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all flex flex-wrap content-start items-center gap-x-2 gap-y-1.5 leading-relaxed overflow-y-auto max-h-[160px] cursor-text"
        >
          {parsedTokens.map((token, idx) => {
            if (token.type === 'column') {
              return (
                <span
                  key={token.id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#B5111B]/10 border border-[#B5111B]/30 text-[#B5111B] shadow-2xs hover:bg-[#B5111B]/15 transition-all select-none"
                  title={`Column Token: ${token.raw}`}
                >
                  <span>{token.colName || token.label}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveToken(idx);
                    }}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-[#B5111B]/20 text-[#B5111B]/70 hover:text-[#B5111B] transition-colors cursor-pointer"
                    title="Remove column"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            }

            if (token.type === 'operator') {
              return (
                <span
                  key={token.id}
                  className="text-sm font-semibold font-mono text-muted-foreground px-0.5 select-none"
                >
                  {token.raw}
                </span>
              );
            }

            if (token.type === 'number') {
              return (
                <span
                  key={token.id}
                  className="text-xs font-semibold font-mono text-foreground px-0.5 select-none"
                >
                  {token.raw}
                </span>
              );
            }

            return (
              <span
                key={token.id}
                className="text-xs font-mono text-muted-foreground px-0.5 select-none"
              >
                {token.raw}
              </span>
            );
          })}

          {/* Inline input allowing typing numbers, operators, or expressions directly inside Chip View */}
          <div className="inline-flex items-center gap-1 my-0.5">
            <input
              ref={inputRef}
              type="text"
              value={inlineInput}
              onChange={e => setInlineInput(e.target.value)}
              onKeyDown={handleInlineKeyDown}
              onBlur={commitInlineInput}
              placeholder={
                parsedTokens.length === 0
                  ? "Type formula (e.g. Value * 10) or click tokens below..."
                  : "type numbers/operators (e.g. * 10 * 10)..."
              }
              className="min-w-[150px] flex-1 bg-transparent text-xs font-mono font-medium outline-none placeholder:text-muted-foreground/45 text-foreground py-0.5 px-1"
            />
          </div>
        </div>
      ) : (
        <textarea
          rows={3}
          className="w-full min-h-[92px] rounded-md border border-input bg-background px-3 py-2 text-xs font-mono font-semibold shadow-2xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary leading-relaxed resize-y"
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={() => onChange(normalizeFormulaSpacing(value))}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
