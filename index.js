const extLib = require('./dist/vtu-reader/index');
const vtkXMLPolyDataReader = require('@kitware/vtk.js/IO/XML/XMLPolyDataReader');
const Converters = require('./dist/convertors/index');

let VTK, converters;

(async () => {
    await Promise.all([extLib.ready, Converters.ready]);
    VTK = new extLib.VTK();
    converters = new Converters.converters();
})();

const cfdToolkit = {
    loadVtuFile(arrayBuffer) {
        if (!VTK) throw new Error('Library not initialized');
        
        VTK.readUnstructuredGrid(arrayBuffer);
        const polydataString = VTK.unstructuredGridToPolyData();
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(polydataString);
        
        const reader = vtkXMLPolyDataReader.newInstance();
        reader.parseAsArrayBuffer(uint8Array.buffer);
        const polyData = reader.getOutputData(0);
        
        const pointData = polyData.getPointData();
        const cellData = polyData.getCellData();

        return {
            points: polyData.getPoints().getData(),
            cells: polyData.getCells().getData(),
            pointData: this.getFieldData(pointData),
            cellData: this.getFieldData(cellData),
            availableFields: [
                ...pointData.getArrays().map(array => array.getName()),
                ...cellData.getArrays().map(array => array.getName())
            ]
        };
    },

    getFieldData(data) {
        const fields = {};
        data.getArrays().forEach(array => {
            fields[array.getName()] = array.getData();
        });
        return fields;
    },

    stlToVtk(stlData) {
        if (!converters) throw new Error('Library not initialized');
        return converters.stlToVtk(stlData);
    },

    stlToVtp(stlData) {
        if (!converters) throw new Error('Library not initialized');
        return converters.stlToVtp(stlData);
    },

    vtkToStl(vtkData) {
        if (!converters) throw new Error('Library not initialized');
        return converters.vtkToStl(vtkData);
    },

    vtpToStl(vtpData) {
        if (!converters) throw new Error('Library not initialized');
        return converters.vtpToStl(vtpData);
    }
};

module.exports = cfdToolkit;