const extLib = require('./dist/index');
const vtkXMLPolyDataReader = require('@kitware/vtk.js/IO/XML/XMLPolyDataReader');

class VtuReader {
    constructor() {
        this.availableFields = [];
        this.data = {};
    }

    /**
     * Loads a VTU file and parses its data.
     * @param {ArrayBuffer} arrayBuffer - The ArrayBuffer of the VTU file.
     * @returns {Promise<Object>} - Returns the parsed data.
     */
    async loadVtuFile(arrayBuffer) {
        try {
            await extLib.ready;
            const VTK = new extLib.VTK();
            
            // Read the unstructured grid from the ArrayBuffer
            await VTK.readUnstructuredGrid(arrayBuffer);
            
            // Convert to PolyData
            const polydataString = VTK.unstructuredGridToPolyData();
            const encoder = new TextEncoder();
            const uint8Array = encoder.encode(polydataString);
            
            // Use vtkXMLPolyDataReader to parse the polydata
            const reader = vtkXMLPolyDataReader.newInstance();
            reader.parseAsArrayBuffer(uint8Array.buffer);

            // Get the parsed PolyData
            const polyData = reader.getOutputData(0);

            // Extract relevant data
            this.extractData(polyData);

            return this.data;
        } catch (err) {
            throw new Error(`Error loading VTU file: ${err.message}`);
        }
    }

    /**
     * Extracts the data from the loaded polydata.
     * @param {vtkPolyData} polyData - The vtkPolyData object.
     */
    extractData(polyData) {
        const pointData = polyData.getPointData();
        const cellData = polyData.getCellData();

        // Collect available fields (pointData and cellData arrays)
        this.availableFields = [
            ...pointData.getArrays().map(array => array.getName()),
            ...cellData.getArrays().map(array => array.getName())
        ];

        // Store the extracted data
        this.data = {
            points: polyData.getPoints().getData(),
            cells: polyData.getCells().getData(),
            pointData: this.getFieldData(pointData),
            cellData: this.getFieldData(cellData)
        };
    }

    /**
     * Converts the field data (arrays) into a simple object format.
     * @param {vtkDataArray} data - The data array (pointData or cellData).
     * @returns {Object} - A mapping of field names to their corresponding data.
     */
    getFieldData(data) {
        const fields = {};
        data.getArrays().forEach(array => {
            fields[array.getName()] = array.getData();
        });
        return fields;
    }
}

module.exports = VtuReader;
