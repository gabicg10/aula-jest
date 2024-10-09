import FifaPlayers from '../model/FifaPlayers';
import { DatabaseModel } from '../model/DatabaseModel';

// Jest.mock para o DatabaseModel
jest.mock('../model/DatabaseModel', () => {
    // Definir o mockQuery dentro do mock
    const mockQuery = jest.fn(); // Mock da função query
    return {
        DatabaseModel: jest.fn().mockImplementation(() => ({
            pool: {
                query: mockQuery, // Atribuindo o mockQuery à função query
            },
        })),
        mockQuery, // Exportar o mockQuery para ser usado nos testes
    };
});

describe('FifaPlayers', () => {
    const mockDatabase = new DatabaseModel().pool;

    // Limpar mocks após cada teste
    afterEach(() => {
        jest.clearAllMocks();
    });

    // Testes para listarPlayersCards
    describe('listarPlayersCards', () => {
        it('deve retornar uma lista de cards de jogadores em caso de sucesso', async () => {
            const mockResult = {
                rows: [
                    {
                        playerid: 1,
                        playername: 'Lionel Messi',
                        rating: 94,
                        position: 'Forward',
                        club: 'Inter Miami',
                    },
                ],
            };
            // Mock do comportamento esperado para a query
            (mockDatabase.query as jest.Mock).mockResolvedValue(mockResult);

            const result = await FifaPlayers.listarPlayersCards();
            expect(result).toEqual(mockResult.rows);
        });

        it('deve retornar uma mensagem de erro em caso de falha', async () => {
            // Mock para simular um erro no banco de dados
            (mockDatabase.query as jest.Mock).mockRejectedValue(new Error('Database error'));

            const result = await FifaPlayers.listarPlayersCards();
            expect(result).toBe('error, verifique os logs do servidor');
        });
    });

    // Testes para removerPlayerCard
    describe('removerPlayerCard', () => {
        it('deve retornar true quando o card de jogador for removido com sucesso', async () => {
            const mockDeleteResult = { rowCount: 1 };
            // Mock de sucesso ao deletar um jogador
            (mockDatabase.query as jest.Mock).mockResolvedValue(mockDeleteResult);

            const result = await FifaPlayers.removerPlayerCard(1);
            expect(result).toBe(true);
        });

        it('deve retornar false quando não houver card de jogador para remover', async () => {
            const mockDeleteResult = { rowCount: 0 };
            // Mock de falha ao deletar um jogador (nenhum registro encontrado)
            (mockDatabase.query as jest.Mock).mockResolvedValue(mockDeleteResult);

            const result = await FifaPlayers.removerPlayerCard(2);
            expect(result).toBe(false);
        });

        it('deve retornar false e capturar erro em caso de falha na query', async () => {
            // Mock para simular um erro ao deletar um jogador
            (mockDatabase.query as jest.Mock).mockRejectedValue(new Error('Delete error'));

            const result = await FifaPlayers.removerPlayerCard(1);
            expect(result).toBe(false);
        });
    });
});
