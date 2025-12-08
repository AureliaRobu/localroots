import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'privacy' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function PrivacyPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'privacy' });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">{t('heading')}</h1>

      <div className="prose prose-slate max-w-none">
        <p className="text-sm text-muted-foreground mb-8">{t('lastUpdated')}</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('introduction.title')}</h2>
          <p>{t('introduction.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('informationCollection.title')}</h2>
          <h3 className="text-xl font-semibold mb-3">{t('informationCollection.personalInfo.title')}</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>{t('informationCollection.personalInfo.items.0')}</li>
            <li>{t('informationCollection.personalInfo.items.1')}</li>
            <li>{t('informationCollection.personalInfo.items.2')}</li>
            <li>{t('informationCollection.personalInfo.items.3')}</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">{t('informationCollection.farmerInfo.title')}</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>{t('informationCollection.farmerInfo.items.0')}</li>
            <li>{t('informationCollection.farmerInfo.items.1')}</li>
            <li>{t('informationCollection.farmerInfo.items.2')}</li>
            <li>{t('informationCollection.farmerInfo.items.3')}</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">{t('informationCollection.automaticInfo.title')}</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('informationCollection.automaticInfo.items.0')}</li>
            <li>{t('informationCollection.automaticInfo.items.1')}</li>
            <li>{t('informationCollection.automaticInfo.items.2')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('howWeUse.title')}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('howWeUse.items.0')}</li>
            <li>{t('howWeUse.items.1')}</li>
            <li>{t('howWeUse.items.2')}</li>
            <li>{t('howWeUse.items.3')}</li>
            <li>{t('howWeUse.items.4')}</li>
            <li>{t('howWeUse.items.5')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('dataSharing.title')}</h2>
          <p className="mb-4">{t('dataSharing.intro')}</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('dataSharing.items.0')}</li>
            <li>{t('dataSharing.items.1')}</li>
            <li>{t('dataSharing.items.2')}</li>
            <li>{t('dataSharing.items.3')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('dataSecurity.title')}</h2>
          <p>{t('dataSecurity.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('thirdParty.title')}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('thirdParty.items.0')}</li>
            <li>{t('thirdParty.items.1')}</li>
            <li>{t('thirdParty.items.2')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('yourRights.title')}</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>{t('yourRights.items.0')}</li>
            <li>{t('yourRights.items.1')}</li>
            <li>{t('yourRights.items.2')}</li>
            <li>{t('yourRights.items.3')}</li>
            <li>{t('yourRights.items.4')}</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('cookies.title')}</h2>
          <p>{t('cookies.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('children.title')}</h2>
          <p>{t('children.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('changes.title')}</h2>
          <p>{t('changes.content')}</p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">{t('contact.title')}</h2>
          <p>{t('contact.content')}</p>
          <p className="mt-4">
            <strong>Email:</strong> privacy@localroots.com<br />
            <strong>Address:</strong> LocalRoots, 123 Farm Road, Agricultural District
          </p>
        </section>
      </div>
    </div>
  );
}
