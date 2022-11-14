function cube(){
    // For now we write in hard each vertex and their colours, we should be able to load .obj files.
    // const vertexData = [
    //     -1.0, -1.0,  1.0,
    //     1.0, -1.0,  1.0,
    //     1.0,  1.0,  1.0,
    //     -1.0,  1.0,  1.0,

    //     -1.0, -1.0, -1.0,
    //     -1.0,  1.0, -1.0,
    //     1.0,  1.0, -1.0,
    //     1.0, -1.0, -1.0,

    //     -1.0,  1.0, -1.0,
    //     -1.0,  1.0,  1.0,
    //     1.0,  1.0,  1.0,
    //     1.0,  1.0, -1.0,

    //     -1.0, -1.0, -1.0,
    //     1.0, -1.0, -1.0,
    //     1.0, -1.0,  1.0,
    //     -1.0, -1.0,  1.0,

    //     1.0, -1.0, -1.0,
    //     1.0,  1.0, -1.0,
    //     1.0,  1.0,  1.0,
    //     1.0, -1.0,  1.0,

    //     -1.0, -1.0, -1.0,
    //     -1.0, -1.0,  1.0,
    //     -1.0,  1.0,  1.0,
    //     -1.0,  1.0, -1.0,
    // ];
    const vertexData = [
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        -1.0,  1.0, -1.0,

        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
    ];
    
    // The colour matrix has one column for each value in the RGBA format. The only caveat is that it has to be between 0 and 1 to work properly.
    const shapeColour = [0., 0., 0., 0.];
    // We make and fill an array with the colour of the faces for each of this face's vertex (since colours are per vertex).
    var vertexColoursData = [];
    for (var faceCont = 8; faceCont > 0; faceCont--) {
        // Repeat each color four times for the four vertices of the face
        vertexColoursData = vertexColoursData.concat(shapeColour);
    }

    // This array defines the triangles of the object's mesh using the indices pointing to specific vertices in the vertex array.
    // const triangleMeshVertexIndices = [
    //     0,  1,  2,      0,  2,  3, 
    //     4,  5,  6,      4,  6,  7, 
    //     8,  9,  10,     8,  10, 11,
    //     12, 13, 14,     12, 14, 15,
    //     16, 17, 18,     16, 18, 19,
    //     20, 21, 22,     20, 22, 23,
    // ];
    const triangleMeshVertexIndices = [
        0, 1, 3,    3, 1, 2,
        1, 5, 2,    2, 5, 6,
        5, 4, 6,    6, 4, 7,
        4, 0, 7,    7, 0, 3,
        3, 2, 7,    7, 2, 6,
        4, 5, 0,    0, 5, 1,
    ];

    return [vertexData, vertexColoursData, triangleMeshVertexIndices];
}