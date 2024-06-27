import { CSSProperties, useEffect, useRef } from "react";
import { JSONEditorPropsOptional, Mode, JSONEditor as VanillaJsonEditor } from "vanilla-jsoneditor";

const editorStyle: { [key: string]: string } & CSSProperties = {
  "--jse-a-color": "white",
  "--jse-delimiter-color": "white",
  "--jse-key-color": "white",
  "--jse-text-color": "white",
  "--jse-value-color": "white",
  "--jse-value-color-boolean": "white",
  "--jse-value-color-null": "white",
  "--jse-value-color-number": "white",
  "--jse-value-color-string": "white",
  "--jse-value-color-url": "white",
  "--jse-background-color": "transparent",
  "--jse-panel-background": "transparent",
  "--jse-selection-background-color": "rgba(255, 255, 255, 0.5)",
  "--jse-main-border": "2px solid rgba(255, 255, 255, 0.5)",
  "--jse-panel-border": "2px solid rgba(255, 255, 255, 0.5)",
};

interface JsonEditorProps extends JSONEditorPropsOptional {
  readonly label?: string;
}

export default function JsonEditor({ label, ...editorProps }: JsonEditorProps) {
  const refContainer = useRef<HTMLDivElement>(null);
  const refEditor = useRef<VanillaJsonEditor | null>(null);

  useEffect(() => {
    if (refContainer.current) {
      refEditor.current = new VanillaJsonEditor({ target: refContainer.current, props: {} });
    }

    return () => {
      if (refEditor.current) {
        refEditor.current.destroy();
        refEditor.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (refEditor.current) {
      refEditor.current.updateProps({ mode: Mode.text, mainMenuBar: false, ...editorProps });
    }
  }, [editorProps]);

  return (
    <div className="container" style={editorStyle} ref={refContainer}>
      {label ? <label>{label}</label> : null}
      <style jsx>{`
        .container {
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.8em;
        }
        label {
          font-style: italic;
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}
