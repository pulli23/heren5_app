var appRoot = 'src/';
var outputRoot = 'static/dist/';
var exporSrvtRoot = 'export/static/';

module.exports = {
  root: appRoot,
  source: appRoot + '**/*.ts',
  html: appRoot + '**/*.html',
  css: appRoot + '**/*.css',
  style: 'static/styles/**/*.css',
  output: outputRoot,
  outputRelease: outputRoot + 'rel/',
  outputDebug: outputRoot + 'src/',
  exportSrv: exporSrvtRoot,
  doc: './doc',
  e2eSpecsSrc: 'test/e2e/src/**/*.ts',
  e2eSpecsDist: 'test/e2e/dist/',
  dtsSrc: [
    './typings/**/*.d.ts',
    './custom_typings/**/*.d.ts'
  ]
}
