package hu.project.MediWeb.modules.statistic.controller;

import hu.project.MediWeb.modules.statistic.entity.Statistic;
import hu.project.MediWeb.modules.statistic.repository.StatisticRepository;
import hu.project.MediWeb.modules.user.entity.User;
import hu.project.MediWeb.modules.user.enums.UserRole;
import hu.project.MediWeb.modules.user.repository.UserRepository;
import hu.project.MediWeb.support.AbstractIntegrationTest;
import hu.project.MediWeb.support.AuthTestSupport;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MvcResult;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Issue #46 — a StatisticController nyers CRUD végpontjai (GET all, GET/PUT/DELETE/{id},
 * increment-search, increment-medication, GET /user/{userId}, POST) ma tulajdonos-ellenőrzés
 * nélkül működnek, és a Statistic JPA entitást (beágyazott User-rel) szerializálják.
 * <p>
 * Ez a teszt két USER-t (tulajdonos + idegen) és egy ADMIN-t seedel AuthTestSupport-tal,
 * mindegyikhez egy Statistic rekordot, majd ellenőrzi a tulajdonos/ADMIN-only hozzáférést.
 * Jelenleg (implementáció előtt) PIROS: a végpontok bárkinek 200-at adnak vissza és
 * kiszerializálják a beágyazott "user" objektumot.
 */
class StatisticControllerIntegrationTest extends AbstractIntegrationTest {

    private static final String OWNER_EMAIL = "stat-owner@test.com";
    private static final String STRANGER_EMAIL = "stat-stranger@test.com";
    private static final String ADMIN_EMAIL = "stat-admin@test.com";

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private StatisticRepository statisticRepository;
    @Autowired
    private AuthTestSupport authTestSupport;
    @Autowired
    private JsonMapper objectMapper;

    private User owner;
    private User stranger;
    private User admin;
    private String ownerToken;
    private String strangerToken;
    private String adminToken;
    private Integer ownerStatId;

    @BeforeEach
    void seed() {
        // Korábbi futás takarítása (FK miatt előbb a statisztikák, mielőtt a felhasználót
        // az AuthTestSupport.createUser saját idempotens előtörlése törölné)
        deleteStatisticsFor(OWNER_EMAIL);
        deleteStatisticsFor(STRANGER_EMAIL);
        deleteStatisticsFor(ADMIN_EMAIL);

        owner = authTestSupport.createUser(OWNER_EMAIL, UserRole.USER);
        stranger = authTestSupport.createUser(STRANGER_EMAIL, UserRole.USER);
        admin = authTestSupport.createUser(ADMIN_EMAIL, UserRole.ADMIN);

        ownerToken = authTestSupport.bearerToken(OWNER_EMAIL);
        strangerToken = authTestSupport.bearerToken(STRANGER_EMAIL);
        adminToken = authTestSupport.bearerToken(ADMIN_EMAIL);

        Statistic ownerStat = statisticRepository.save(Statistic.builder()
                .user(owner)
                .searchCount(1)
                .medicationsAddedCount(1)
                .lastSearch(LocalDateTime.now())
                .lastMedicationAdded(LocalDateTime.now())
                .build());
        ownerStatId = ownerStat.getId();
    }

    private void deleteStatisticsFor(String email) {
        userRepository.findByEmail(email).ifPresent(u ->
                statisticRepository.findByUserId(u.getId().intValue()).ifPresent(statisticRepository::delete));
    }

    @Test
    @DisplayName("GET /api/statistics/{id}: idegen tokennel 403")
    void getById_foreignToken_returns403() throws Exception {
        mockMvc.perform(get("/api/statistics/{id}", ownerStatId).header("Authorization", strangerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/statistics/{id}: tulajdonos tokennel 200")
    void getById_ownerToken_returns200() throws Exception {
        mockMvc.perform(get("/api/statistics/{id}", ownerStatId).header("Authorization", ownerToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/statistics/{id}: ADMIN tokennel idegen rekordra is 200")
    void getById_adminToken_returns200() throws Exception {
        mockMvc.perform(get("/api/statistics/{id}", ownerStatId).header("Authorization", adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/statistics/{id}: nem létező id-ra 404 (nem 200 + üres törzs)")
    void getById_nonExistentId_returns404() throws Exception {
        mockMvc.perform(get("/api/statistics/{id}", 999_999_999).header("Authorization", ownerToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /api/statistics/{id}: idegen tokennel 403, a számlálók nem változnak")
    void updateById_foreignToken_returns403_andUnchanged() throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("searchCount", 999);
        body.put("medicationsAddedCount", 999);

        mockMvc.perform(put("/api/statistics/{id}", ownerStatId)
                        .header("Authorization", strangerToken)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isForbidden());

        Statistic stillOwners = statisticRepository.findById(ownerStatId).orElseThrow();
        assertThat(stillOwners.getSearchCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("PUT /api/statistics/{id}/increment-search: tulajdonos tokennel 200, a számláló nő")
    void incrementSearch_ownerToken_returns200_andIncremented() throws Exception {
        mockMvc.perform(put("/api/statistics/{id}/increment-search", ownerStatId)
                        .header("Authorization", ownerToken))
                .andExpect(status().isOk());

        Statistic updated = statisticRepository.findById(ownerStatId).orElseThrow();
        assertThat(updated.getSearchCount()).isEqualTo(2);
    }

    @Test
    @DisplayName("PUT /api/statistics/{id}/increment-search: idegen tokennel 403, a számláló nem nő")
    void incrementSearch_foreignToken_returns403_andUnchanged() throws Exception {
        mockMvc.perform(put("/api/statistics/{id}/increment-search", ownerStatId)
                        .header("Authorization", strangerToken))
                .andExpect(status().isForbidden());

        Statistic unchanged = statisticRepository.findById(ownerStatId).orElseThrow();
        assertThat(unchanged.getSearchCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("PUT /api/statistics/{id}/increment-medication: idegen tokennel 403, a számláló nem nő")
    void incrementMedication_foreignToken_returns403_andUnchanged() throws Exception {
        mockMvc.perform(put("/api/statistics/{id}/increment-medication", ownerStatId)
                        .header("Authorization", strangerToken))
                .andExpect(status().isForbidden());

        Statistic unchanged = statisticRepository.findById(ownerStatId).orElseThrow();
        assertThat(unchanged.getMedicationsAddedCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("DELETE /api/statistics/{id}: idegen tokennel 403, a rekord megmarad")
    void delete_foreignToken_returns403_andRecordPersists() throws Exception {
        mockMvc.perform(delete("/api/statistics/{id}", ownerStatId).header("Authorization", strangerToken))
                .andExpect(status().isForbidden());

        assertThat(statisticRepository.findById(ownerStatId)).isPresent();
    }

    @Test
    @DisplayName("GET /api/statistics: USER tokennel 403")
    void getAll_userToken_returns403() throws Exception {
        mockMvc.perform(get("/api/statistics").header("Authorization", ownerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/statistics: ADMIN tokennel 200, a válasz nem tartalmaz beágyazott user/password mezőt, de userId-t igen")
    void getAll_adminToken_returns200_withoutEntityLeak() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/statistics").header("Authorization", adminToken))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode array = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(array.isArray()).isTrue();
        assertThat(array.size()).isGreaterThan(0);

        for (JsonNode node : array) {
            assertThat(node.has("user"))
                    .as("a válasz nem szerializálhatja a beágyazott User entitást (jelszóhash-szivárgás)")
                    .isFalse();
            assertThat(node.has("password")).isFalse();
            assertThat(node.has("userId"))
                    .as("a DTO-nak tartalmaznia kell a userId mezőt")
                    .isTrue();
        }
    }

    @Test
    @DisplayName("GET /api/statistics/user/{userId}: idegen userId-ra 403")
    void getByUserId_foreignUserId_returns403() throws Exception {
        mockMvc.perform(get("/api/statistics/user/{userId}", owner.getId()).header("Authorization", strangerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("GET /api/statistics/user/{userId}: saját userId-val 200")
    void getByUserId_ownUserId_returns200() throws Exception {
        mockMvc.perform(get("/api/statistics/user/{userId}", owner.getId()).header("Authorization", ownerToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("GET /api/statistics/user/{userId}: ADMIN tokennel idegen userId-ra is 200")
    void getByUserId_adminToken_returns200() throws Exception {
        mockMvc.perform(get("/api/statistics/user/{userId}", owner.getId()).header("Authorization", adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("POST /api/statistics: a törzsben küldött idegen user nem érvényesül, a tulajdonos a bejelentkezett felhasználó lesz")
    void create_ownerIsForcedFromToken_ignoresBodyUser() throws Exception {
        Map<String, Object> userRef = new HashMap<>();
        userRef.put("id", stranger.getId());

        Map<String, Object> body = new HashMap<>();
        body.put("user", userRef);
        body.put("searchCount", 5);
        body.put("medicationsAddedCount", 0);

        MvcResult result = mockMvc.perform(post("/api/statistics")
                        .header("Authorization", ownerToken)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().is2xxSuccessful())
                .andReturn();

        Integer createdId = objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asInt();
        Statistic saved = statisticRepository.findById(createdId).orElseThrow();

        assertThat(saved.getUser().getId())
                .as("a szerver a bejelentkezett felhasználót (owner) kell beállítsa tulajdonosnak, ne a törzsben küldött idegen user-t")
                .isEqualTo(owner.getId());
    }
}
