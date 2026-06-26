import express from 'express';
import constructorMethod from './routes/index.js';

const app = express();
constructorMethod(app);

const inspectLayer = (layer, prefix = '') => {
  if (layer.route) {
    console.log(prefix + JSON.stringify({ path: layer.route.path, methods: layer.route.methods }));
  } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
    console.log(prefix + `router layer: ${layer.regexp}`);
    layer.handle.stack.forEach((l) => inspectLayer(l, prefix + '  '));
  } else {
    console.log(prefix + `middleware: ${layer.name} ${layer.regexp}`);
  }
};

app._router.stack.forEach((layer) => inspectLayer(layer));
