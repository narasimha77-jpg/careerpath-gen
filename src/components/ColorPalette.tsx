interface ColorPaletteProps {
  colors: string[];
}

const ColorPalette = ({ colors }: ColorPaletteProps) => {
  if (!colors || colors.length === 0) return null;

  return (
    <div>
      <h4 className="font-semibold mb-3 text-sm">Theme Colors</h4>
      <div className="flex gap-3">
        {colors.map((color, index) => (
          <div key={index} className="flex flex-col items-center gap-2">
            <div
              className="w-16 h-16 rounded-xl shadow-md border-2 border-background transition-transform hover:scale-110"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs font-mono text-muted-foreground">{color}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;
