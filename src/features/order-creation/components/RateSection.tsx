
import React from 'react';
import { FormProps } from '../types';

/**
 * RateSection component
 * Displays and controls rate settings for the order
 */
interface RateSectionProps {
  formProps: FormProps;
}

const RateSection: React.FC<RateSectionProps> = ({ formProps }) => {
  const { 
    t, 
    formData,
    updateFormData,
    formatRate
  } = formProps;

  // Get the service fee from the form data
  const serviceFee = formData.serviceFee;

  return (
    <div className="space-y-6 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="rateType" className="block text-sm font-medium">
            {t('rateType')}
          </label>
          <select
            id="rateType"
            value={formData.rateType}
            onChange={(e) => updateFormData({ rateType: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="dynamic">{t('dynamic')}</option>
            <option value="fixed">{t('fixed')}</option>
          </select>
        </div>

        {formData.rateType === 'dynamic' ? (
          <div className="space-y-2">
            <label htmlFor="rateSource" className="block text-sm font-medium">
              {t('rateSource')}
            </label>
            <select
              id="rateSource"
              value={formData.rateSource}
              onChange={(e) => updateFormData({ rateSource: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {formData.rateSources && formData.rateSources.map((source) => (
                <option key={source.code} value={source.code}>
                  {source.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="space-y-2">
            <label htmlFor="customRate" className="block text-sm font-medium">
              {t('customRate')}
            </label>
            <input
              id="customRate"
              type="text"
              value={formData.customRate || ''}
              onChange={(e) => updateFormData({ customRate: e.target.value })}
              placeholder="0.00"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="rateAdjustment" className="block text-sm font-medium">
          {t('rateAdjustment')}
        </label>
        <div className="flex items-center">
          <input
            id="rateAdjustment"
            type="number"
            step="0.01"
            value={formData.rateAdjustment || '0'}
            onChange={(e) => updateFormData({ rateAdjustment: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="ml-2">%</span>
        </div>
      </div>

      {serviceFee !== undefined && (
        <div className="space-y-2">
          <label htmlFor="serviceFee" className="block text-sm font-medium">
            {t('serviceFee')}
          </label>
          <div className="flex items-center">
            <input
              id="serviceFee"
              type="number"
              step="0.01"
              value={serviceFee}
              onChange={(e) => updateFormData({ serviceFee: parseFloat(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="ml-2">%</span>
          </div>
        </div>
      )}

      {formData.currentRate !== undefined && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('finalRate')}</div>
          <div className="text-lg font-medium">{formatRate(formData.currentRate)}</div>
        </div>
      )}
    </div>
  );
};

export default RateSection;
