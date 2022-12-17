function RENDERING_PARAMS(glContext){
    // Define the fov for distortion, in radians and the frustum limits.
    const projec_fov = 45 * Math.PI/180;
    const projec_zNear = 0.1;
    const projec_zFar = 100.0;

    // Tell the context how the vertex shader should read from the vertex buffer.
    const vv_valuesPerIter = 3;
    const vv_bufferDataType = glContext.FLOAT;
    const vv_normalize = false;
    const vv_stride = 0;
    const vv_offset = 0;
    
    // Tell the context how the vertex shaders should read from the colour buffer.
    const vc_valuesPerIter = 4;
    const vc_bufferDataType = glContext.FLOAT;
    const vc_normalize = false;
    const vc_stride = 0;
    const vc_offset = 0;

    // The drawArrays function need to be given the number of vertices total and from which to start.
    const draw_offset = 0;
    const draw_type = glContext.UNSIGNED_SHORT;

    const paramsDict = {"projection": {"projec_fov": projec_fov,
                                     "projec_zNear": projec_zNear,
                                     "projec_zFar": projec_zFar,},
                        "vv": {"vv_valuesPerIter": vv_valuesPerIter,
                               "vv_bufferDataType": vv_bufferDataType,
                               "vv_normalize": vv_normalize,
                               "vv_stride": vv_stride,
                               "vv_offset": vv_offset,},
                        "vc": {"vc_valuesPerIter": vc_valuesPerIter,
                               "vc_bufferDataType": vc_bufferDataType,
                               "vc_normalize": vc_normalize,
                               "vc_stride": vc_stride,
                               "vc_offset": vc_offset,},
                        "draw": {"draw_offset": draw_offset,
                                 "draw_type": draw_type,},};

    return paramsDict;
}