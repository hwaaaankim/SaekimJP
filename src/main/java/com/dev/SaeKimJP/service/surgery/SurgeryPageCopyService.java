package com.dev.SaeKimJP.service.surgery;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SurgeryPageCopyService {
    private final JdbcTemplate jdbc;
    private static final Set<String> PAGES = Set.of("eye", "nose", "young", "contouring");
    public SurgeryPageCopyService(JdbcTemplate jdbc) { this.jdbc = jdbc; }
    public record Copy(String content, long version) {}

    @Transactional(readOnly = true)
    public Map<String, Copy> findPage(String page) {
        if (!PAGES.contains(page)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        Map<String, Copy> result = new LinkedHashMap<>();
        jdbc.query("SELECT copy_key, content, version FROM surgery_page_copy WHERE page_key = ?",
            rs -> { result.put(rs.getString("copy_key"), new Copy(rs.getString("content"), rs.getLong("version"))); }, page);
        return result;
    }

    @Transactional
    public Copy update(String page, String key, String text, Long version, String editor) {
        if (!PAGES.contains(page) || key == null || !key.matches(page + "\\.[0-9]{4}"))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        if (text == null || text.isBlank() || text.length() > 10000 || version == null || version < 0)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "本文は1～10000文字で入力してください。");
        String content = text.replace("\r\n", "\n").replace('\r', '\n').strip();
        if (content.indexOf('\0') >= 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
        int changed = jdbc.update("UPDATE surgery_page_copy SET content=?, version=version+1, updated_by=?, updated_at=CURRENT_TIMESTAMP WHERE copy_key=? AND page_key=? AND version=?",
            content, editor, key, page, version);
        if (changed != 1) throw new ResponseStatusException(HttpStatus.CONFLICT, "他の編集者による更新、または初期データの不足を確認してください。");
        return new Copy(content, version + 1);
    }
}
