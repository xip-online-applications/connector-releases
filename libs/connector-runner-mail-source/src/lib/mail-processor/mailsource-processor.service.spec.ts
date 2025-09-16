describe('ConnectorRunnerFileSink', () => {
  it('should filter according to the regex', async () => {
    const regexString = 'bestellung.+\\.csv';
    const fileSelector = {
      pattern: regexString,
      flags: 'i',
    };

    const files = ['bestellung_OA100122.csv', 'other'];

    const regex = new RegExp(fileSelector.pattern, fileSelector.flags);
    console.log(`fileSelector ${fileSelector.pattern}`);
    const filteredFiles = files.filter((f) => regex.test(f));
    expect(filteredFiles.length).toEqual(1);
  });
});
