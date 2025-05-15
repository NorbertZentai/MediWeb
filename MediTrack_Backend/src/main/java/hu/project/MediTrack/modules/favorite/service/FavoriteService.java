package hu.project.MediTrack.modules.favorite.service;

import hu.project.MediTrack.modules.favorite.entity.Favorite;
import hu.project.MediTrack.modules.favorite.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    /**
     * Visszaadja az összes favorite bejegyzést.
     */
    public List<Favorite> findAll() {
        return favoriteRepository.findAll();
    }

    /**
     * Visszaadja az adott id-jú favorite bejegyzést, ha létezik.
     */
    public Optional<Favorite> findById(Integer id) {
        return favoriteRepository.findById(id);
    }

    /**
     * Elment egy favorite bejegyzést (létrehoz vagy frissít).
     */
    public Favorite save(Favorite favorite) {
        // Itt pl. ellenőrizheted, hogy van-e duplikát:
        // (user, medication) pair már létezik-e stb.
        return favoriteRepository.save(favorite);
    }

    /**
     * Töröl egy favorite bejegyzést ID alapján.
     */
    public void deleteById(Integer id) {
        favoriteRepository.deleteById(id);
    }

    /**
     * Visszaadja egy user összes kedvenc gyógyszerét.
     */
    public List<Favorite> findByUserId(Integer userId) {
        return favoriteRepository.findByUserId(userId);
    }
}
