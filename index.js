const fs = require('fs');
const path = require('path');
const checkEngines = require('check-engines');
const run = require('child_process').execSync;
const bsConfig = require('./bsconfig.template.js');

function addBsbScripts(projectPath) {

  const pkgPath = projectPath + '/package.json';
  const pkg = require(pkgPath);

  pkg.scripts = Object.assign(
    {},
    pkg.scripts,
    {
      "build": "bsb -make-world -clean-world",
      "watch": "bsb -make-world -clean-world -w"
    }
  );

  fs.writeFileSync(
    pkgPath,
    JSON.stringify(
      pkg,
      null,
      2
    )
  )
}

function slugify(text) {
  return text.replace(/[A-Z]/g, m => {
    return `-${m.toLowerCase()}`;
  }).slice(1)
}

function sh(cmd) {
  run(cmd, { stdio: 'inherit' });
}

function npm(package, opts) {
  const { dev } = opts || {};
  sh(`npm i ${package.join(' ')} ${dev ? "--save-dev": "--save"}`)
}

function yarn(package, opts) {
  const { dev } = opts || {};
  sh(`yarn add ${package.join(' ')} ${dev ? "--dev": ""}`);
}

function main(argv) {

  checkEngines(err => {
    if (err) {
      console.error(err);
    }
  });  

  if (argv.length < 3) {
    console.error('Usage: install-reason-react-native <ProjectName in Pascal case>');
  }

  const projectName = argv[2];
  const projectNameSlugified = slugify(projectName);

  const projectPath = path.join(
    process.cwd(),
    projectName
  );
  
  sh(`react-native init ${projectName}`);

  process.chdir(
    projectPath
  );

  fs.writeFileSync(
    'bsconfig.json',
    JSON.stringify(
      bsConfig(
        projectNameSlugified
      ),
      null,
      2
    )
  );

  let npmClient = yarn;
  try {
    sh('which yarn')
  } catch(e) {
    npmClient = npm;
  }

  npmClient([
    'bs-platform@3.1.5',
    'reason-react@0.3.4',
    'bs-react-native'
  ]);

  addBsbScripts(projectPath);

  fs.mkdirSync('src');

  fs.writeFileSync(
    path.join(
      projectPath,
      'src',
      'App.re'
    ),
    fs.readFileSync(
      path.join(
        __dirname,
        'App.template.re'
      )
    )
  );
      
  fs.writeFileSync(
    path.join(
      projectPath,
      'index.js'
    ),
    fs.readFileSync(
      path.join(
        __dirname,
        'rn-index.template.js'
      )
    )
  );

}

main(process.argv);
