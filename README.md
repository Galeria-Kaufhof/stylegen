# stylegen [![Build Status](https://travis-ci.org/Galeria-Kaufhof/stylegen.svg?branch=master)](https://travis-ci.org/Galeria-Kaufhof/stylegen)

**stylegen** should be an easy to use styleguide generator for arbitrary projects. There is no assumption about programming languages and only a few ones about your projects code structure.

What **stylegen** ships is an executable that parses your project for configuration files and some templates which describe your work and builds a ready to deploy static styleguide out of it.

## getting started

### prerequisites

As **stylegen** is based upon Node.js, we have to get that installed first. So just download a [prebuilt version](https://nodejs.org) or install it via your favorite package manager, like [Homebrew](http://brew.sh/). Afterwards the command-line tools `node` and its corresponding package manager `npm` should be available.

### stylegen installation

**stylegen** is shipped with an executable so that can just install it globally with `npm` as usual (the --global flag assures, that the executable is linked inside your path).

```bash
npm install --global stylegen
```

After a successful installation you should have the `stylegen` command available in your commandline which we can test easily with:

```
stylegen help
```

Which should result in an output like

```bash
> stylegen help
>
> Usage: stylegen [options] <command>
>
> stylegen v0.x.x
>
> a static styleguide generator
>
> [...]
```

## styleguide introduction

Now, with the tooling at hand, lets get started with the actual styleguide. We need to setup some configurations and templates, so that the tool gets its instructions of what to build in the end.

At first you should create a **styleguide.yaml** file (or .json if writing brackets is more of your taste :)). The *styleguide*-Configuration is usually expected in the folder where you will run the `stylegen create` command later on.

And to have some starting content, lets create a markdown file in a sub-folder, that contains our static page content. So lets create a sub-folder `pages`
and a file inside of it called `introduction.md`. On unix machines you may just run the following command:

```bash
mkdir -p ./pages && printf "Some introduction text, that provides an entry to your styleguide.\n" > ./pages/introduction.md
```

> **NOTE:** the current working directory, styleguide config path and similar can be configured in an advanced setup.

Lets assume a simple basic configuration as a starting point:

```yaml
# project name
project: Example

# resulting content structure
content:
  - label: introduction
    type: md
    content: pages/introduction.md
```

so our current content should look something like this:

```
├── pages
│   └── introduction.md
└── styleguide.yaml
```

No we are able to run our styleguide tool the first time with a resulting styleguide created out of the given (yes, very simple) content.

So just run `stylegen create` and you should receive something like that:

```
> Cli.command create
> […]
> Styleguide.write: finished writing
```

And in result there should be a freshly generated folder `styleguide` inside this directory, that contains the according generated files. At the moment you may just open the `introduction.html` page to have a first impression on what our styleguide may look like. To serve this repository with live-reload enabled so that changes appear immediately you may want to take a look at [live-server](https://www.npmjs.com/package/live-server) or something similar.

> **NOTE:** Because of keeping the project scope clear and concise (it is actually about building styleguides out of files), we've decided for not adding such tooling to the executable, so you won't find file watchers or servers inside this project.

Beside static content, which is a little bit boring, the core of a web-styleguide is the possibility to describe a pattern library aside to your frontend components.

Lets assume/create a folder structure, that contains exactly one component called 'button' so we have a simple example.

```bash
> mkdir -p components/button
> touch components/button/component.yaml
> printf "---\ntext: ExampleButton\n---\n<button>{{text}}</button>" > components/button/view.hbs
```

> **NOTE:** if you have an asset structure that has a component structure already, you may just lay any configurations aside to the component files.
In case you don't have something like that, e.g. you may have only a few css/js files in a flat folder, you can lay your **stylegen** component files in
a folder tree anywhere you think it fits in.

To identify a component as such, we have to add a file called **component.yaml** (or .json) to that directory. By doing this we say, ok in this directory i describe a component. A component folder may contain "sub-components", with their own *component.yaml* files, but that does not really matter for **stylegen**. Any grouping and structuring of the resulting styleguide is done inside of the *styleguide.yaml*, so that we later on may change the file structure, without disturbing the styleguide and vise versa.

A *component*-configuration may contain a variety of information, but we start with a very simple one.

```yaml
label: Button
id: btn
```

---


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
| assets                    |                           | static asset files, that should be copied to the styleguide directory, head for "Assets" for further information
| content                   |                           | list of page configurations, take a look at "Content"
| componentDocs             | "."                       | path of component doc files, relative to the given component.yml

#### Dependencies

| Property                  | Default                     | Description     
|---------------------------|-----------------------------|--------------------
| styles                    |                             | styles that should be linked in the head section of your page
| js                        |                             | js that is loaded at the end of your body tag
| templates                 |                             | see dependecy templates

#### Dependencies Templates

| Property                  | Default                     | Description     
|---------------------------|-----------------------------|--------------------
| head                      | []                          | may contain a list of filepathes, of that each content is placed in the head tag
| bottom                    | []                          | may contain a list of filepathes, of that each content is placed in right before the closing body tag


#### Assets

| Property                  | Default                     | Description     
|---------------------------|-----------------------------|--------------------
| src                       |                             | file or directory, that should be copied to the styleguide
| js                        |                             | target path for that file or directory

#### Content

| Property                  | Default                     | Description     
|---------------------------|-----------------------------|--------------------
| label                     |                             | the label of a page is used for the link text for example *required
| type                      |                             | either one of "md" or "tags", to define a page to be a plain markdown document or a list of components grouped by tags
| content                   |                             | in case type is "md", content must be a relative path to that document, otherwise a list of tags is expected
| children                  |                             | like content itself this is a list of page configurations
| preflight                 |                             | a preflight markdown document that is rendered in front of a component listing (so it is only "valid" for nodes of type 'tags' or 'components')  


---


### Component-Config (component.yaml / component.json)

Component configuration files are usually located adjacent to the component content, but it is not mandatory. Likewise to the styleguide configurations,
you can use component.yaml or component.json files for the configurations.
As well as for styleguides we recommend the usage of yaml as configuration language.

#### Base Properties

| Property                  | Default                     | Description     
|---------------------------|-----------------------------|--------------------
| id                        | directory basename          | namespace unique identifier
| label                     |                             | label is used for the component headline for example
| namespace                 | app                         | prefix e.g. for components and partials
| tags                      | []                          | list of tags, that is used for content structure building
| partials                  | [*_partial.hbs]             | reusable list of partials for creating entities of this component. Partials are prefixed with the configured namespace.
| view                      | "view.hbs"                  | the view is the renderable preview inside of the component
| docs                      | [*.md]                      | list of markdown documents, that describe the component. See "Documentation"
| states                    | {}                          | list of states a component may have, e.g. hover, disabled, active, etc. --> "States"
| viewContext               |                             | Object context that is passed to the rendered view

#### Documentation

| Property                  | Default                     | Description     
|---------------------------|-----------------------------|--------------------
| key: value                |                             | key determines the label of a document, while the value is a component relative path to the document. (e.g. "business": "component-business.md")

#### States

| Property                  | Default                     | Description     
|---------------------------|-----------------------------|--------------------
| id: State                 |                             | an object with key as "id" for the state and a "State" as value

#### States

| Property                  | Default                     | Description     
|---------------------------|-----------------------------|--------------------
| id: State                 |                             |


---


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

## LICENSE

[The MIT License (MIT)](https://raw.githubusercontent.com/Galeria-Kaufhof/stylegen/master/LICENSE)
