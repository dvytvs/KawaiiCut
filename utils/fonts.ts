export const OS_FONT_CANDIDATES = [
    'Arial', 'Arial Black', 'Bahnschrift', 'Calibri', 'Cambria', 'Cambria Math', 'Candara', 
    'Comic Sans MS', 'Consolas', 'Constantia', 'Corbel', 'Courier', 'Courier New', 'Ebrima', 
    'Franklin Gothic Medium', 'Gabriola', 'Gadugi', 'Georgia', 'HoloLens MDL2 Assets', 'Impact', 
    'Javanese Text', 'Leelawadee UI', 'Lucida Console', 'Lucida Sans Unicode', 'Malgun Gothic', 
    'Marlett', 'Microsoft Himalaya', 'Microsoft JhengHei', 'Microsoft New Tai Lue', 'Microsoft PhagsPa', 
    'Microsoft Sans Serif', 'Microsoft Tai Le', 'Microsoft YaHei', 'Microsoft Yi Baiti', 'MingLiU-ExtB', 
    'Mongolian Baiti', 'MS Gothic', 'MV Boli', 'Myanmar Text', 'Nirmala UI', 'Palatino Linotype', 
    'Segoe Print', 'Segoe Script', 'Segoe UI', 'Segoe UI Historic', 'Segoe UI Emoji', 'Segoe UI Symbol', 
    'SimSun', 'Sitka Small', 'Sitka Text', 'Sitka Subheading', 'Sitka Heading', 'Sitka Display', 
    'Sitka Banner', 'Sylfaen', 'Symbol', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana', 
    'Webdings', 'Wingdings', 'Yu Gothic', 
    'American Typewriter', 'Andale Mono', 'Arial Narrow', 'Arial Rounded MT Bold', 'Arial Unicode MS', 
    'Avenir', 'Avenir Next', 'Avenir Next Condensed', 'Baskerville', 'Big Caslon', 'Bodoni 72', 
    'Bodoni 72 Oldstyle', 'Bodoni 72 Smallcaps', 'Bradley Hand', 'Brush Script MT', 'Chalkboard', 
    'Chalkboard SE', 'Chalkduster', 'Charter', 'Cochin', 'Copperplate', 'Didot', 'DIN Alternate', 
    'DIN Condensed', 'Futura', 'Geneva', 'Gill Sans', 'Helvetica', 'Helvetica Neue', 'Herculanum', 
    'Hoefler Text', 'Lucida Grande', 'Luminari', 'Marker Felt', 'Menlo', 'Monaco', 'Noteworthy', 
    'Optima', 'Palatino', 'Papyrus', 'Phosphate', 'Rockwell', 'SignPainter', 'Skia', 'Snell Roundhand', 
    'Trattatello',
    'Ubuntu', 'Liberation Sans', 'Liberation Serif', 'Liberation Mono', 'DejaVu Sans', 'DejaVu Serif', 
    'DejaVu Sans Mono', 'FreeSans', 'FreeSerif', 'FreeMono', 'Noto Sans', 'Noto Serif', 'Noto Mono'
].sort((a,b) => a.localeCompare(b));

export const detectLocalFontsFallback = () => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return [];
    
    const testString = "mmmmmmmmmmlli";
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const detectedFonts: string[] = [];
    const baseWidths: { [key: string]: number } = {};
    
    for (const base of baseFonts) {
        context.font = `72px ${base}`;
        baseWidths[base] = context.measureText(testString).width;
    }
    for (const font of OS_FONT_CANDIDATES) {
        let detected = false;
        for (const base of baseFonts) {
            context.font = `72px "${font}", ${base}`;
            if (context.measureText(testString).width !== baseWidths[base]) {
                detected = true;
                break;
            }
        }
        if (detected) detectedFonts.push(font);
    }
    return detectedFonts;
};
