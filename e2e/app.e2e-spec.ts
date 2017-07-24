import { CopayRecoveryNg4appPage } from './app.po';

describe('copay-recovery-ng4app App', () => {
  let page: CopayRecoveryNg4appPage;

  beforeEach(() => {
    page = new CopayRecoveryNg4appPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
