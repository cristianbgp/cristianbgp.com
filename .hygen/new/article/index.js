module.exports = {
  prompt: ({ inquirer }) => {
    const questions = [
      {
        type: "input",
        name: "article_name",
        message: "What is the article name?",
      },
      {
        type: "input",
        name: "description",
        message: "What is the description?",
      },
    ];
    return inquirer.prompt(questions).then((answers) => {
      const { article_name, description } = answers;
      const absPath = "pages/articles";
      const date = new Date().toJSON();
      return { article_name, description, absPath, date };
    });
  },
};
