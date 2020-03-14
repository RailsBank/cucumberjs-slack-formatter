const { Formatter, SummaryFormatter, formatterHelpers } = require('cucumber');

class CucumberjsSlackFormatter extends Formatter {
    /** @param {Options} options */
    constructor(options) {
        super(options);
        this.colorsEnabled = options.colorsEnabled;
        this.descriptionEnabled = options.descriptionEnabled;

        options.eventBroadcaster.on('test-case-started', (event) => {
            const { gherkinDocument, pickle } = options.eventDataCollector.getTestCaseAttempt(event);

            this.log("case started", )


            if (this.uri !== event.sourceLocation.uri) {
                const { feature } = gherkinDocument;

                if (this.uri) this.logn();

                const tags = feature.tags.map((tag) => tag.name).join(' ');
                if (tags) this.logn(options.colorFns.tag(tags));

                this.logn(`${feature.keyword}: ${feature.name}`);

                if (feature.description && this.descriptionEnabled) this.logn(`${feature.description}`);

                this.uri = event.sourceLocation.uri;
            }
            //
            // this.logn();
            //
            const tags = pickle.tags.map((tag) => tag.name).join(' ');
            if (tags) this.logn(tags, 2);
            //
            const line = Math.min(...pickle.locations.map((location) => location.line));
            const { keyword } = gherkinDocument.feature.children.find((child) => child.location.line === line);
            //
            this.logn(`${keyword}: ${pickle.name}`, 2);
        });

        options.eventBroadcaster.on('test-step-started', (event) => {
            const testCaseAttempt = options.eventDataCollector.getTestCaseAttempt(event.testCase);

            this.log("step started", JSON.stringify(testCaseAttempt,null, 4))
            // testCaseAttempt.stepResults = testCaseAttempt.testCase.steps.map(() => ({}));
            //
            // const testStep = formatterHelpers.parseTestCaseAttempt({ testCaseAttempt }).testSteps[event.index];
            // if (!testStep.sourceLocation) return; // hook
            //
            // this.logn(`${this.color(testStep.keyword.trim(), 'bold')} ${testStep.text}`, 4);
            //
            // testStep.arguments.forEach((argument) => {
            //     if (argument.content) {
            //         this.logn(`"""${n}${argument.content}${n}"""`, 6);
            //     }
            //
            //     if (argument.rows) {
            //         const datatable = new Table(table);
            //         datatable.push(...argument.rows);
            //         this.logn(datatable, 6);
            //     }
            // });
        });

        options.eventBroadcaster.on('test-step-finished', (event) => {
            const { result: { status, exception } } = event;

            // if (status !== 'passed') {
            //     this.logn(options.colorFns[status](`${marks[status]} ${status}`), 4);
            // }
            //
            // if (exception) {
            //     const error = formatterHelpers.formatError(exception, options.colorFns);
            //     this.logn(error, 6);
            // }
            this.log("finished ", JSON.stringify(status), JSON.stringify(exception))

        });

        options.eventBroadcaster.on('test-run-finished', (event) => {
            const noptions = Object.create(options, { eventBroadcaster: { value: { on: () => { } } } });
            // const formatter = new SummaryFormatter(noptions);
            // if (this.uri) this.logn();
            // formatter.logSummary(event);
            this.log("sup")

        });
    }

    // color(value, ...color) {
    //     return this.colorsEnabled ? color.reduce((v, c) => v[c], colors)(value) : value;
    // }

    logn(value = '', indent = 0) {
        let text = value.toString();
        if (indent > 0) text = text.replace(/^/gm, ' '.repeat(indent));
        this.log(`${text}`);
    }
}

module.exports = CucumberjsSlackFormatter;
