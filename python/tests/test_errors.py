"""Tests for the canonical error envelope parser + MnemomError.

Mirror of typescript/src/__tests__/errors.test.ts — the two parsers must agree.
"""

from mnemom_types import MnemomError, parse_mnemom_error


class TestParseMnemomError:
    """parse_mnemom_error is BODY-ONLY (no status — that comes from the response)."""

    def test_reads_nested_envelope_first(self) -> None:
        p = parse_mnemom_error(
            {"error": {"code": "not_found", "message": "agent is not on file", "details": {"id": "x"}}}
        )
        assert p.message == "agent is not on file"
        assert p.code == "not_found"
        assert p.details == {"id": "x"}

    def test_does_not_drop_message_when_error_is_object(self) -> None:
        # The regression: a naive top-level read sees body["error"] as a dict
        # and drops the message. Nested-first prevents that.
        p = parse_mnemom_error({"error": {"code": "forbidden", "message": "outside org scope"}})
        assert p.message == "outside org scope"

    def test_tolerates_flat_error_string(self) -> None:
        p = parse_mnemom_error({"error": "plain flat message"})
        assert p.message == "plain flat message"
        assert p.code is None

    def test_tolerates_flat_with_top_level_code(self) -> None:
        p = parse_mnemom_error({"error": "auth not configured", "code": "auth_not_configured"})
        assert p.message == "auth not configured"
        assert p.code == "auth_not_configured"

    def test_top_level_message_detail_fallback(self) -> None:
        assert parse_mnemom_error({"message": "legacy top-level"}).message == "legacy top-level"
        assert parse_mnemom_error({"detail": "detail field"}).message == "detail field"

    def test_captures_spec_deviation(self) -> None:
        p = parse_mnemom_error(
            {
                "error": {"code": "undocumented_status_code", "message": "Internal error."},
                "spec_deviation": {"keyword": "status_code_conformance", "original_status": 404},
            }
        )
        assert p.spec_deviation is not None
        assert p.spec_deviation.original_status == 404

    def test_bare_string_body(self) -> None:
        assert parse_mnemom_error("raw text").message == "raw text"

    def test_empty_for_none_or_non_dict(self) -> None:
        assert parse_mnemom_error(None).message is None
        assert parse_mnemom_error(42).message is None


class TestMnemomError:
    def test_carries_structured_fields(self) -> None:
        e = MnemomError("boom", status=409, code="conflict", details={"a": 1})
        assert isinstance(e, Exception)
        assert e.message == "boom"
        assert e.status == 409
        assert e.effective_status == 409
        assert e.code == "conflict"
        assert e.details == {"a": 1}

    def test_from_response_assembles_status_and_prefers_server_message(self) -> None:
        e = MnemomError.from_response(
            {"error": {"code": "forbidden", "message": "outside org scope"}}, 403
        )
        assert e.message == "outside org scope"
        assert e.status == 403
        assert e.effective_status == 403
        assert e.code == "forbidden"

    def test_from_response_fallback_message(self) -> None:
        e = MnemomError.from_response({}, 503, "Request failed")
        assert e.message == "Request failed: 503"

    def test_from_response_effective_status_unwraps_synthetic_500(self) -> None:
        e = MnemomError.from_response(
            {
                "error": {"code": "undocumented_status_code", "message": "Internal error."},
                "spec_deviation": {"original_status": 404},
            },
            500,
        )
        assert e.status == 500
        assert e.effective_status == 404
