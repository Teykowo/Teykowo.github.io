function resizeCanvas(){
    glContext = window.linkedContext;
    devicePixelRatio = window.devicePixelRatio;

    glContext.canvas.width = (glContext.canvas.clientWidth * devicePixelRatio);
    glContext.canvas.height = (glContext.canvas.clientHeight * devicePixelRatio);
    glContext.viewport(0, 0, glContext.canvas.width, glContext.canvas.height);
}