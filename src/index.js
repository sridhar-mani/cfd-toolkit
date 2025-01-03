import rom from '@simzero/rom';
import cfdutils from '@simzero/cfdutils';
import vtkXMLPolyDataReader from '@kitware/vtk.js/IO/XML/XMLPolyDataReader';


class CFDToolkit {
    static async initializeLibraries() {
        try {
            await Promise.all([rom.ready, cfdutils.ready]);
            CFDToolkit.VTK = new rom.VTK();
            CFDToolkit.converters = cfdutils;
            console.log('Libraries initialized successfully');
        } catch (err) {
            console.error('Error initializing libraries:', err);
            throw new Error('Library initialization failed');
        }
    }

    static async loadVtuFile(file) {
        if (!CFDToolkit.VTK) {
            throw new Error('Library not initialized');
        }

        try {

       
            const arrayBuffer = await file.arrayBuffer();
            console.log("File loaded, size:", arrayBuffer.byteLength);

          
            await CFDToolkit.VTK.readUnstructuredGrid(arrayBuffer);
            console.log("Unstructured grid read successfully");

            const polydataString = CFDToolkit.VTK.unstructuredGridToPolyData();
            if (!polydataString || polydataString.length === 0) {
                throw new Error('Invalid PolyData string generated');
            }

            const encoder = new TextEncoder();
            const uint8Array = encoder.encode(polydataString);

            const reader = vtkXMLPolyDataReader.newInstance();
            reader.parseAsArrayBuffer(uint8Array.buffer);
            const polyData = reader.getOutputData(0);

            if (!polyData) {
                console.error('PolyData is undefined');
                throw new Error('PolyData is undefined');
            }


            const points = polyData.getPoints();
            const pointsData = points.getData ? points.getData() : [];
            const cells = polyData.getCells();
            const cellsData = cells ? cells.getData() : [];


            const bounds = polyData.getBounds();
            const pointData = polyData.getPointData();
            const cellData = polyData.getCellData();

 
            const availableFields = [
                ...new Set([
                    ...pointData.getArrays().map(array => array.getName()),
                    ...cellData.getArrays().map(array => array.getName())
                ])
            ];


            const scalarRanges = {};
            pointData.getArrays().forEach(array => {
                if (array.getDataType() === 'Float32' || array.getDataType() === 'Float64') {
                    scalarRanges[array.getName()] = array.getRange();
                }
            });

   
            return {
                bounds,
                points: pointsData,
                cells: cellsData,
                pointData: CFDToolkit.extractFieldData(pointData),
                cellData: CFDToolkit.extractFieldData(cellData),
                availableFields,
                polyData,
                scalarRanges
            };
        } catch (error) {
            console.error('Error processing VTU file:', error);
            throw error;
        }
    }

    static extractFieldData(data) {
        const fields = {};
        if (data) {
            data.getArrays().forEach(array => {
      
                if (array.getData) {
                    fields[array.getName()] = array.getData();
                } else {
                    fields[array.getName()] = array; 
                }
            });
        }
        return fields;
    }

 
    static async stlToVtk(stlData) {
        if (!CFDToolkit.converters) {
            console.error("Converters library not initialized");
            throw new Error('Library not initialized');
        }
        const converters = new CFDToolkit.converters.converters();
        return converters.stlToVtk(stlData);
    }


    static async stlToVtp(stlData) {
        if (!CFDToolkit.converters) {
            console.error("Converters library not initialized");
            throw new Error('Library not initialized');
        }
        const converters = new CFDToolkit.converters.converters();
        return converters.stlToVtp(stlData);
    }

    static async vtkToStl(vtkData) {
        if (!CFDToolkit.converters) {
            console.error("Converters library not initialized");
            throw new Error('Library not initialized');
        }
        const converters = new CFDToolkit.converters.converters();
        return converters.vtkToStl(vtkData);
    }


    static async vtpToStl(vtpData) {
        if (!CFDToolkit.converters) {
            console.error("Converters library not initialized");
            throw new Error('Library not initialized');
        }
        const converters = new CFDToolkit.converters.converters();
        return converters.vtpToStl(vtpData);
    }
}

CFDToolkit.initializeLibraries();

export default CFDToolkit;
