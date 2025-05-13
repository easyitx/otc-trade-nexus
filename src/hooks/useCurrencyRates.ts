import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { apiUrl, wsUrl } from '../../config.ts';

interface CurrencyPair {
    value: string;
    label: string;
}

interface RateSource {
    code: string;
    name: string;
}

interface CurrencyRatesData {
    rates: Record<string, number> | null;
    allRates: Record<string, Record<string, number>>;
    loading: boolean;
    error: string | null;
    currencyPair: string;
    availablePairs: CurrencyPair[];
    availableSources: RateSource[];
    setCurrencyPair: (pair: string) => void;
}

export const useCurrencyRates = (): CurrencyRatesData => {
    const [rates, setRates] = useState<Record<string, number> | null>(null);
    const [allRates, setAllRates] = useState<Record<string, Record<string, number>>>({});
    const [loading, setLoading] = useState(true);
    const [currencyPair, setCurrencyPair] = useState<string>('');
    const [availablePairs, setAvailablePairs] = useState<CurrencyPair[]>([]);
    const [availableSources, setAvailableSources] = useState<RateSource[]>([]);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Загружаем доступные пары и источники
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Загружаем доступные валютные пары
                const pairsResponse = await axios.get(`${apiUrl}/exchange-rates/pairs`);
                setAvailablePairs(pairsResponse.data);

                // Загружаем доступные источники
                const sourcesResponse = await axios.get(`${apiUrl}/exchange-rates/sources`);
                setAvailableSources(sourcesResponse.data);

                // Устанавливаем первую пару как выбранную по умолчанию
                if (pairsResponse.data.length > 0) {
                    setCurrencyPair(pairsResponse.data[0].value);

                    // Загружаем текущие курсы для выбранной пары
                    const pair = encodeURIComponent(pairsResponse.data[0].value);
                    const ratesResponse = await axios.get(`${apiUrl}/exchange-rates/${pair}`);
                    setRates(ratesResponse.data);
                }

                // Загружаем все текущие курсы
                const allRatesResponse = await axios.get(`${apiUrl}/exchange-rates`);
                setAllRates(allRatesResponse.data);
            } catch (err) {
                console.error("Ошибка загрузки данных:", err);
                setError('Ошибка загрузки данных');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();

        // Инициализация WebSocket соединения
        const newSocket = io(`${wsUrl}/exchange-rates`, {
            transports: ['websocket'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            forceNew: true
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    // Обработка смены валютной пары
    useEffect(() => {
        if (!currencyPair) return;

        const fetchRatesForPair = async () => {
            try {
                setLoading(true);
                const pair = encodeURIComponent(currencyPair);
                const response = await axios.get(`${apiUrl}/exchange-rates/${pair}`);
                setRates(response.data);
            } catch (err) {
                console.error(`Ошибка загрузки курсов для ${currencyPair}:`, err);
                setError(`Ошибка загрузки курсов для ${currencyPair}`);
            } finally {
                setLoading(false);
            }
        };

        fetchRatesForPair();
    }, [currencyPair]);

    // Обработка WebSocket событий
    useEffect(() => {
        if (!socket) return;

        const handleRatesUpdated = (data: { pair: string; rates: Record<string, number> }) => {
            // Обновляем данные для конкретной пары
            if (data.pair === currencyPair) {
                setRates(data.rates);
            }

            // Обновляем общие данные
            setAllRates(prev => ({
                ...prev,
                [data.pair]: data.rates
            }));
        };

        const handleRatesSnapshot = (data: Record<string, Record<string, number>>) => {
            setAllRates(data);
            if (currencyPair in data) {
                setRates(data[currencyPair]);
            }
        };

        socket.on('rates-updated', handleRatesUpdated);
        socket.on('rates-snapshot', handleRatesSnapshot);

        return () => {
            socket.off('rates-updated', handleRatesUpdated);
            socket.off('rates-snapshot', handleRatesSnapshot);
        };
    }, [socket, currencyPair]);

    return {
        rates,
        allRates,
        loading,
        error,
        currencyPair,
        availablePairs,
        availableSources,
        setCurrencyPair
    };
};