'use strict';

const chalk = require('chalk');
const figures = require('figures');
const ListPrompt = require('inquirer/lib/prompts/list');

function listRender(choices, pointer) {
  let output = '';
  let separatorOffset = 0;

  choices.forEach((choice, i) => {
    if (choice.type === 'separator') {
      separatorOffset++;
      output += '  ' + choice + '\n';
      return;
    }
    if (choice.disabled) {
      separatorOffset++;
      output += '  - ' + choice.name;
      output += ` (${typeof choice.disabled === 'string' ? choice.disabled : 'Disabled'})`;
      output += '\n';
      return;
    }

    const isSelected = i - separatorOffset === pointer;
    let line = (isSelected ? figures.pointer + ' ' : '  ') + choice.name;
    if (isSelected) line = chalk.green(line);
    output += line + ' \n';
  });

  return output.replace(/\n$/, '');
}

class GreenListPrompt extends ListPrompt {
  render() {
    let message = this.getQuestion();

    if (this.firstRender) message += chalk.dim('(usa las flechas)');

    if (this.status === 'answered') {
      message += chalk.green(this.opt.choices.getChoice(this.selected).short);
    } else {
      const choicesStr = listRender(this.opt.choices, this.selected);
      const indexPosition = this.opt.choices.indexOf(this.opt.choices.getChoice(this.selected));
      const realIndexPosition = this.opt.choices.reduce((acc, value, i) => {
        if (i > indexPosition) return acc;
        if (value.type === 'separator') return acc + 1;
        let l = value.name;
        if (typeof l !== 'string') return acc + 1;
        return acc + l.split('\n').length;
      }, 0) - 1;
      message += '\n' + this.paginator.paginate(choicesStr, realIndexPosition, this.opt.pageSize);
    }

    this.firstRender = false;
    this.screen.render(message);
  }
}

module.exports = GreenListPrompt;
