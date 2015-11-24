# stylegen

(**NOTE**: stylegen itself is only a code name for now, we should search for something, that is available as npm project too.)

**stylegen** should be an easy to use styleguide generator for arbitrary projects. There is no assumption about programming languages and only a few ones about your projects code structure.

What **stylegen** ships is an executable that parses your project for **stylegen** specific configuration files, and builds a ready to deploy static styleguide.

## Usage

install the tool, with `npm install -g stylegen`

- add a styleguide.yaml or .json file to your project
- add component.yaml or .json files to your components
- run `stylegen` inside the project


### Styleguide-Config (styleguide.yaml / styleguide.json)

This file must be located in the project root and declares the project settings. It may be either written in yaml format (styleguide.yaml) or as plain json (styleguide.json). We prefer yaml format for configurations, but  you are free to choose json as well.

#### Base Properties

| Property                  | Default                     | Description     
|---------------------------|-----------------------------|--------------------
| project                   |                             | project name
| namespace                 | "app"                       | a namespace, that e.g your helpers are prefixed with
| componentPaths            | ["components"]              | relative directory paths, in that your component configurations are located
| target                    | "styleguide"                | the compile target for the resulting styleguide
| dependencies              | {}                          | see "Dependencies" below
| assets                    | []                          | static asset files, that should be copied to the styleguide directory, head for "Assets" for further information
| content                   | []                          | list of page configurations, take a look at "Content"

#### Dependencies

| Property                  | Default                     | Description     
|---------------------------|-----------------------------|--------------------
| styles                    |                             | styles that should be linked in the head section of your page
| js                        |                             | js that is loaded at the end of your body tag

#### Assets

| Property                  | Default                     | Description     
|---------------------------|-----------------------------|--------------------
| src                       |                             | file or directory, that should be copied to the styleguide
| js                        |                             | target path for that file or directory

#### Content

| Property                  | Default                     | Description     
|---------------------------|-----------------------------|--------------------
| label                     |                             | the label of a page is used for the link text for example
| type                      |                             | either one of "md" or "tags", to define a page to be a plain markdown document or a list of components grouped by tags
| content                   |                             | in case type is "md", content must be a relative path to that document, otherwise a list of tags is expected
| children                  |                             | like content itself this is a list of page configurations



### Component-Config (component.yaml / component.json)

Component configuration files are usually located adjacent to the component content, but it is not mandatory. Likewise to the styleguide configurations,
you can use component.yaml or component.json files for the configurations.
As well as for styleguides we recommend the usage of yaml as configuration language.

#### Base Properties

| Property                  | Default                     | Description     
|---------------------------|-----------------------------|--------------------
| id                        | directory basename          | namespace unique identifier
| label                     |                             | label is used for the component headline for example
| namespace                 | styleguide namespace        | prefix for partials
| tags                      | []                          | list of tags, that is used for content structure building
| partials                  | []                          | reusable list of partials for creating entities of this component. Partials are prefixed with the configured namespace.
| view                      | ""                          | the view is the renderable preview inside of the component
| docs                      | []                          | list of markdown documents, that describe the component. See "Documentation"

#### Documentation

| Property                  | Default                     | Description     
|---------------------------|-----------------------------|--------------------
| key: value                |                             | key determines the label of a document, while the value is a component relative path to the document. (e.g. "business": "component-business.md")



## Contribution / Development

To get **stylegen** up and running for your development, just create your fork and run `npm install` in it.

For TypeScript compilation, please install the TypeScript npm package:

(Because we rely on es6 but want to have the commonjs import syntax to have it running on node, please install the latest typescript package with `@next`)

```
npm install -g typescript@next
```

Install also the Typedefinitions with tsd:

```
npm install tsd -g

tsd install
```

To work with stylegen, it may make sense to link the executable bin/stylegen into your PATH, so that you may call it also in other directories,
without having the need to call everytime for the absolute or relative path.

To develop new features you may want to add a file structure e.g. like that:

```
├── assets
│   ├── components
│   │   ├── atoms
│   │   │   └── form-elements
│   │   │       ├── button
│   │   │       │   ├── button_danger_partial.hbs
│   │   │       │   ├── button_partial.hbs
│   │   │       │   ├── button_primary_partial.hbs
│   │   │       │   ├── button_view.hbs
│   │   │       │   └── component.json
│   │   │       └── text_field
│   │   │           ├── component.json
│   │   │           ├── text_field_partial.hbs
│   │   │           └── text_field_view.hbs
│   │   └── moleculars
│   │       └── forms
│   │           └── search_form
│   │               ├── component.json
│   │               └── search_form_view.hbs
│   └── globals
└── styleguide.json
```
