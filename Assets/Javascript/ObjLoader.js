class ObjLoader {
    constructor() {
        this.fileContent = null;
        // We store the name of the given shape.
        this.shapeName = '';
        // Vertex coordinates.
        this.vertexData = [];
        // The colour matrix has one column for each value in the RGBA format
        this.vertexColoursData = [];
        // This array defines the triangles of the object's mesh using the indices pointing to specific vertices in the vertex array.
        this.triangleMeshVertexIndices = [];
    }

    async loadFile(path, fillColourArray = [0., 0., 0., 0.]) {
        try {
            // Ensure the file is a .obj file and the path a string, as it's the only one working with this loader. If it's not then return an error message.
            if (!path.endsWith('.obj')) {
                throw new Error('An incorrect file format has been given to the ObjLoader. Be sure it is in the wavefront .obj format.');
            }
            // Check if the browser has fetch support.
            if (!window.fetch) {
                throw new Error('Your browser does not support the technologies used by this website (fetch).');
            }
        } catch (oException) {
            // All exception are catched and their message displayed, standard cube data is returned for the app to still somewhat work.
            console.log(oException.message);
            
            // Return default cube data.
            this.#defaultCube(fillColourArray);
            return [this.vertexData, this.vertexColoursData, this.triangleMeshVertexIndices]
        }

        // If no error has been returned, then fetch the obj file at path.
        let file = await fetch(path);
        // Read the file.
        this.fileContent = await file.text()

        // Split the content to have a line by line array. 
        let lines = this.fileContent.split('\n');
        // Iterate over the lines.
        lines.forEach(currentLine => {
            // Trim the line to ensure only the relevent data is present.
            currentLine = currentLine.trim();
            // Split the line by space to seperate it's keyword and data points
            let lineArgs = currentLine.split(' ');
            // Select the keyword which is always the first part of the line.
            let keyword = lineArgs[0];
            switch (keyword) {
                case 'o':
                    // "o" stands for the object's name so we store it as a class attribute.
                    this.shapeName = lineArgs[1];
                    break;
                case 'v':
                    // "v" stands for vertex, so we store each by adding it to the vertexData array.
                    // Vertices are in placed in 3D space by three arguments that we join together in a list.
                    this.vertexData = this.vertexData.concat([parseFloat(lineArgs[1]), parseFloat(lineArgs[2]), parseFloat(lineArgs[3])]);
                    break;
                case 'f':
                    // "f" stands for face, each line is composed of 3 sets of indices that each respectively point to:
                    // a vertex, texture coordinate, and/or normal, so as to compose a triangle of the object's mesh.

                    // Indices are separated by '/' so we split them to get each of the seperate indices in a list.
                    let argOne = lineArgs[1].split('/');
                    let argTwo = lineArgs[2].split('/');
                    let argThree = lineArgs[3].split('/');
                    // We are only interested in the vertex indices as we do not have textures nor lighting. 
                    // .obj indices appear to start at one instead of 0 so we subtract 1 from each.
                    this.triangleMeshVertexIndices = this.triangleMeshVertexIndices.concat([parseFloat(argOne[0])-1, parseFloat(argTwo[0])-1, parseFloat(argThree[0])-1]);
                    break;
                default:
                    // "#", "mtllib", "vt", "vn", stand for comments, seperate material file name, texture coordinates, normals. 
                    // "usemtl" indicate that all geometries that appear after it use a specific material.
                    // "s" indicates a smoothing group for vertex normals generation using the normals of all the faces it shares. 
                    // All these cases can be ignored.
                    break;
            }
        });

        // Finally, generate a uniform colour using the number of vertices (array length divided by three as every vertex has 3 component).
        this.#setColour(fillColourArray, this.vertexData.length/3);
        // Return shape data.
        return [this.vertexData, this.vertexColoursData, this.triangleMeshVertexIndices]
    }

    #setColour(fillColourArray, vertexCount) {
        // The colour matrix has one column for each value in the RGBA format. The only caveat is that it has to be between 0 and 1 to work properly.
        // We fill an array with the colour of the faces for each of this face's vertex (since colours are per vertex).
        for (let faceCont = vertexCount; faceCont > 0; faceCont--) {
            // Repeat each color four times for the four vertices of the face
            this.vertexColoursData = this.vertexColoursData.concat(fillColourArray);
        }
    }

    #defaultCube(fillColourArray) {
        // Standard cube vertex data.
        this.vertexData = [
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0,  1.0, -1.0,
            -1.0,  1.0, -1.0,

            -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
        ];
        // Standard cube vertex colours.
        this.#setColour(fillColourArray, 8);
        // Standard cube mesh indices.
        this.triangleMeshVertexIndices = [
            0, 1, 3,    3, 1, 2,
            1, 5, 2,    2, 5, 6,
            5, 4, 6,    6, 4, 7,
            4, 0, 7,    7, 0, 3,
            3, 2, 7,    7, 2, 6,
            4, 5, 0,    0, 5, 1,
        ];
    }
}





