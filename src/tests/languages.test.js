import { render, screen, fireEvent} from '@testing-library/react';
import { LanguageProvider, useLanguage } from '../components/LanguageContext';

const TestComponent = () => {
  const { t, setLanguage } = useLanguage();

  return (
    <div>
      <p>{t.routes.Register}</p>
      <p>{t.routes.About}</p> 
      <button onClick={() => setLanguage("English")}>English</button>
      <button onClick={() => setLanguage("Hungarian")}>Hungarian</button>
    </div>
  );
};

describe('LanguageContext', () => {
  it('Correct English language version for "Register"', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Ellenőrizd, hogy az angol "Register" megfelelően jelenik meg
    expect(screen.getByText('Register')).toBeInTheDocument();
  });
  
  it('Correct English language version for "About"', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Ellenőrizd, hogy az angol "Register" megfelelően jelenik meg
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('Correct Hungarian language version for "Register"', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );

    // Nyelvváltás angolról magyarra
    fireEvent.click(screen.getByText('Hungarian'));

    expect(screen.getByText('Regisztráció')).toBeInTheDocument(); // 'Regisztrálás' magyarul
  });

  it('Correct Hungarian language version for "About"', () => {
    render(
      <LanguageProvider>
        <TestComponent />
      </LanguageProvider>
    );
    fireEvent.click(screen.getByText('Hungarian'));

    // Ellenőrizd, hogy az angol "Register" megfelelően jelenik meg
    expect(screen.getByText('A projektről')).toBeInTheDocument();
  });
});
