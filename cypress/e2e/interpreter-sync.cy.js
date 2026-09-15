describe('playground interpreter sync', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err) => {
      if (err.message.includes('Hydration')) return false;
    });
  });
  it('executes synced interpreter examples through the Run button', () => {
    cy.visit('/playground?code=' + encodeURIComponent('har i mein silsilo(3) { likh(i) }'));
    cy.get('#run-button', { timeout: 30000 }).should('be.visible').click({ force: true });
    cy.get('pre', { timeout: 120000 })
      .should('contain', '0')
      .and('contain', '1')
      .and('contain', '2');
  });
});
