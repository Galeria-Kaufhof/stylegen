# Upfront

(**NOTE**: Upfront itself is only a code name for now, we should search for something, that is available as npm project too.)

**Upfront** should be an easy to use styleguide generator for arbitrary projects. There is no assumption about programming languages and only a few ones about your projects code structure.

What **Upfront** ships is an executable that parses your project for **Upfront** specific configuration files, and builds a ready to deploy static styleguide.

## Usage

install the tool, with `npm install -g upfront`

- add a styleguide.json to your project
- add component.json files to your components
- run `upfront`

## Contribution / Development

To get **Upfront** up and running for your development, just create your fork and run `npm install` in it.

Install also the Typedefinitions with tsd:

```
npm install tsd -g

tsd install
```

To work with upfront, it may make sense to link the executable bin/upfront into your PATH, so that you may call it also in other directories,
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
