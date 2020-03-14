const {Formatter, formatterHelpers} = require('cucumber');
const axios = require('axios');
const Rxjs = require('rxjs');

class CucumberjsSlackFormatter extends Formatter {

    state = new Rxjs.Subject();


    /** @param {Options} options */
    constructor(options) {
        super(options);

        this.updateSlack(options.slackReporterOptions, this.buildState);

        options.eventBroadcaster.on('test-case-started', (event) => {
            const {pickle} = options.eventDataCollector.getTestCaseAttempt(event);

            this.startCase(pickle.name, pickle.steps.map(step => ({text: step.text})));
        });

        options.eventBroadcaster.on('test-step-started', (event) => {
            const testStep = stepFromEvent(options, event);
            if (!testStep.sourceLocation) return; // skip

            this.startStep(testStep.text);
        });

        options.eventBroadcaster.on('test-step-finished', (event) => {
            const testStep = stepFromEvent(options, event);

            if (!testStep.sourceLocation) return; //skip

            const {result: {status, exception}} = event;

            this.endStep(testStep.text, status, exception)
        });
    }

    startCase(name, steps) {
        console.log('case', name, steps);
    }

    startStep(name) {
        console.log('startstep', name);
    }

    endStep(name, status, exception){
        console.log('stopstep', name, status, exception);
    }

    //failed cases with failed step
    //current case, current step

    //summary
    //case count
    //cases passed
    //cases failed

    //feature
    //tags
    //environment
    //triggered by person
    //full report uploaded here
    ts;


    getBody(buildState, options) {
       return [
           {
               "type": "section",
               "text": {
                   "type": "mrkdwn",
                   "text": `Release run: <http://www|#12345>running *"${options.tags}"* | 12 :arrow_forward:  3 :white_check_mark:  0 :x:`
               }
           },
           {
               "type": "divider"
           },
           {
               "type": "section",
               "text": {
                   "type": "mrkdwn",
                   "text": `*${buildState.current.name}* \n${buildState.current.steps.map(step => step.state).join(' ')}\n - step: ${buildState.current.steps.find(step => step.inProgress).name}`
               }
           },
           {
               "type": "divider"
           },
           {
               "type": "section",
               "text": {
                   "type": "mrkdwn",
                   "text": `Environment *${options.environment}*, triggered by *${options.initiator}*, Full report <http://www|here>`
               }
           }
       ]
    }


    async updateSlack(options,state) {
        // if (!this.ts) {
        //     const response = await axios.post('https://slack.com/api/chat.postMessage', {
        //         channel: options.channel, text: "Starting test run", blocks: this.getBody(state, options)
        //     }, {
        //         headers: {"Authorization": options.authorization, "Content-type": "application/json"}
        //     })
        //     this.ts = response.data.ts;
        // } else {
        //     const response = await axios.post('https://slack.com/api/chat.update', {
        //         channel: options.channel,
        //         text: "Starting test run",
        //         blocks: this.getBody(this.buildState, options),
        //         ts: this.ts
        //     }, {
        //         headers: {"Authorization": options.authorization, "Content-type": "application/json"}
        //     })
        // }
    }
}

module.exports = CucumberjsSlackFormatter;

function stepFromEvent(options, event) {
    const testCaseAttempt = options.eventDataCollector.getTestCaseAttempt(event.testCase);

    testCaseAttempt.stepResults = testCaseAttempt.testCase.steps.map(() => ({}));
    const testStep = formatterHelpers.parseTestCaseAttempt({testCaseAttempt}).testSteps[event.index];
    return testStep;
}
