import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'terms' });
  return {
    title: t('title'),
    description: t('metaDescription'),
  };
}

export default async function TermsPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'terms' });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">{t('heading')}</h1>

      <div className="prose prose-slate max-w-none">
        <p className="text-sm text-muted-foreground mb-8">{t('lastUpdated')}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('acceptance.title')}</h2>
          <p>{t('acceptance.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('serviceDescription.title')}</h2>
          <p>{t('serviceDescription.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('eligibility.title')}</h2>
          <p className="mb-4">{t('eligibility.intro')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('eligibility.items.0')}</li>
            <li>{t('eligibility.items.1')}</li>
            <li>{t('eligibility.items.2')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('accounts.title')}</h2>
          <p className="mb-4">{t('accounts.intro')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('accounts.items.0')}</li>
            <li>{t('accounts.items.1')}</li>
            <li>{t('accounts.items.2')}</li>
            <li>{t('accounts.items.3')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('farmerResponsibilities.title')}</h2>
          <p className="mb-4">{t('farmerResponsibilities.intro')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('farmerResponsibilities.items.0')}</li>
            <li>{t('farmerResponsibilities.items.1')}</li>
            <li>{t('farmerResponsibilities.items.2')}</li>
            <li>{t('farmerResponsibilities.items.3')}</li>
            <li>{t('farmerResponsibilities.items.4')}</li>
            <li>{t('farmerResponsibilities.items.5')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('customerResponsibilities.title')}</h2>
          <p className="mb-4">{t('customerResponsibilities.intro')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('customerResponsibilities.items.0')}</li>
            <li>{t('customerResponsibilities.items.1')}</li>
            <li>{t('customerResponsibilities.items.2')}</li>
            <li>{t('customerResponsibilities.items.3')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('transactions.title')}</h2>
          <p className="mb-4">{t('transactions.intro')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('transactions.items.0')}</li>
            <li>{t('transactions.items.1')}</li>
            <li>{t('transactions.items.2')}</li>
            <li>{t('transactions.items.3')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('prohibited.title')}</h2>
          <p className="mb-4">{t('prohibited.intro')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('prohibited.items.0')}</li>
            <li>{t('prohibited.items.1')}</li>
            <li>{t('prohibited.items.2')}</li>
            <li>{t('prohibited.items.3')}</li>
            <li>{t('prohibited.items.4')}</li>
            <li>{t('prohibited.items.5')}</li>
            <li>{t('prohibited.items.6')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('intellectual.title')}</h2>
          <p className="mb-4">{t('intellectual.platform')}</p>
          <p>{t('intellectual.userContent')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('disclaimer.title')}</h2>
          <p className="mb-4">{t('disclaimer.content')}</p>
          <p className="font-semibold uppercase">{t('disclaimer.asIs')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('limitation.title')}</h2>
          <p>{t('limitation.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('indemnification.title')}</h2>
          <p>{t('indemnification.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('termination.title')}</h2>
          <p className="mb-4">{t('termination.intro')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('termination.items.0')}</li>
            <li>{t('termination.items.1')}</li>
            <li>{t('termination.items.2')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('changes.title')}</h2>
          <p>{t('changes.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('governing.title')}</h2>
          <p>{t('governing.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('contact.title')}</h2>
          <p>{t('contact.content')}</p>
          <p className="mt-4">
            <strong>Email:</strong> legal@localroots.com<br />
            <strong>Address:</strong> LocalRoots, 123 Farm Road, Agricultural District
          </p>
        </section>
      </div>
    </div>
  );
}
