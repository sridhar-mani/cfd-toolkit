# CFD Toolkit

A comprehensive toolkit for CFD (Computational Fluid Dynamics) data processing and format conversion. This library combines VTU file processing capabilities from @simzero/rom with format conversion utilities from @simzero/cfdutils.

## Features

- **VTU File Processing**
  - Load and parse VTU files
  - Extract point and cell data
  - Access scalar field values
  - List available fields

- **Format Conversions**
  - STL to VTK conversion
  - STL to VTP conversion
  - VTK to STL conversion
  - VTP to STL conversion

## Installation

```bash
npm install cfd-toolkit
```

## Usage

```javascript
const cfdToolkit = require('cfd-toolkit');

// Load and parse VTU file
const data = cfdToolkit.loadVtuFile(arrayBuffer);
console.log(data.availableFields);  // List available fields
console.log(data.pointData);        // Access point data
console.log(data.cellData);         // Access cell data

// Format conversions
const vtkData = cfdToolkit.stlToVtk(stlData);
const vtpData = cfdToolkit.stlToVtp(stlData);
const stlFromVtk = cfdToolkit.vtkToStl(vtkData);
const stlFromVtp = cfdToolkit.vtpToStl(vtpData);
```

## License

LGPL-3.0-only - This library incorporates code from @simzero/rom and @simzero/cfdutils, both licensed under LGPL-3.0.

## Credits

This toolkit builds upon:
- [@simzero/rom](https://github.com/simzero/rom) - For VTU file processing
- [@simzero/cfdutils](https://github.com/simzero/cfdutils) - For format conversions
- [vtk.js](https://github.com/Kitware/vtk-js) - For visualization capabilities

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.